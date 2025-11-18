from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.password_validation import validate_password
from django.utils import timezone
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Customer, EmailVerificationToken, PasswordResetToken

User = get_user_model()


class RegisterSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=255)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Este e-mail já está cadastrado.")
        return value

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        email = validated_data["email"].lower()
        user = User.objects.create_user(
            username=email,
            email=email,
            password=validated_data["password"],
            first_name=validated_data["full_name"],
        )
        Customer.objects.create(user=user, full_name=validated_data["full_name"])
        token = EmailVerificationToken.objects.create(user=user)
        return user, token


class TokenPairSerializer(serializers.Serializer):
    access = serializers.CharField(read_only=True)
    refresh = serializers.CharField(read_only=True)

    @staticmethod
    def generate_for_user(user):
        refresh = RefreshToken.for_user(user)
        return {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get("email").lower()
        password = attrs.get("password")
        user = authenticate(username=email, password=password)
        if not user:
            raise serializers.ValidationError("Credenciais inválidas.")
        attrs["user"] = user
        return attrs


class EmailVerificationSerializer(serializers.Serializer):
    token = serializers.CharField()

    def validate(self, attrs):
        token = attrs.get("token")
        try:
            token_obj = EmailVerificationToken.objects.select_related("user").get(token=token)
        except EmailVerificationToken.DoesNotExist:
            raise serializers.ValidationError("Token inválido.")

        if token_obj.used_at:
            raise serializers.ValidationError("Token já utilizado.")
        if token_obj.is_expired:
            raise serializers.ValidationError("Token expirado.")

        attrs["token_obj"] = token_obj
        return attrs

    def save(self, **kwargs):
        token_obj: EmailVerificationToken = self.validated_data["token_obj"]
        try:
            customer = token_obj.user.customer_profile
        except Customer.DoesNotExist:
            raise serializers.ValidationError("Perfil de cliente não encontrado.")
        customer.email_verified = True
        customer.save(update_fields=["email_verified"])
        token_obj.mark_used()
        return customer


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate(self, attrs):
        email = attrs.get("email").lower()
        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("Usuário não encontrado.")
        attrs["user"] = user
        return attrs

    def save(self, **kwargs):
        user = self.validated_data["user"]
        token = PasswordResetToken.objects.create(user=user)
        return token


class ResetPasswordSerializer(serializers.Serializer):
    token = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate_password(self, value):
        validate_password(value)
        return value

    def validate(self, attrs):
        token = attrs.get("token")
        try:
            token_obj = PasswordResetToken.objects.select_related("user").get(token=token)
        except PasswordResetToken.DoesNotExist:
            raise serializers.ValidationError("Token inválido.")

        if token_obj.used_at:
            raise serializers.ValidationError("Token já utilizado.")
        if token_obj.is_expired:
            raise serializers.ValidationError("Token expirado.")

        attrs["token_obj"] = token_obj
        return attrs

    def save(self, **kwargs):
        token_obj: PasswordResetToken = self.validated_data["token_obj"]
        user = token_obj.user
        user.set_password(self.validated_data["password"])
        user.save(update_fields=["password"])
        token_obj.mark_used()
        return user


class CustomerSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email")

    class Meta:
        model = Customer
        fields = ["id", "full_name", "email", "email_verified", "phone_number", "created_at"]
        read_only_fields = ["id", "email", "email_verified", "created_at"]


class UpdateCustomerSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(max_length=255)
    phone_number = serializers.CharField(max_length=20, allow_blank=True)

    class Meta:
        model = Customer
        fields = ["full_name", "phone_number"]


class CustomerAdminSerializer(serializers.ModelSerializer):
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source="user", write_only=True
    )
    email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = Customer
        fields = [
            "id",
            "user_id",
            "full_name",
            "email",
            "email_verified",
            "phone_number",
            "created_at",
        ]
        read_only_fields = ("id", "email", "email_verified", "created_at")