import Link from 'next/link';
import { Mail, Phone, MapPin, Instagram, Facebook, MessageCircle } from 'lucide-react';

const navigation = [
  { label: 'Home', href: '/' },
  { label: 'Feminino', href: '/feminino' },
  { label: 'Masculino', href: '/masculino' },
  { label: 'Infantil', href: '/infantil' },
  { label: 'Acessórios', href: '/acessorios' },
  { label: 'Suporte', href: '/suporte' },
];

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="w-full bg-gradient-to-b from-slate-900 via-slate-950 to-black text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-14 md:grid md:grid-cols-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">Leonete Modas</p>
          <h2 className="mt-3 text-2xl font-semibold">Moda com atitude</h2>
          <p className="mt-4 text-sm text-slate-300">
            Peças selecionadas, atendimento humanizado e uma curadoria feita para quem gosta de se vestir com estilo em qualquer ocasião.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-200">Explorar</h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link className="transition hover:text-white" href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-200">Contato</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            <li className="flex items-start gap-3">
              <Mail className="h-4 w-4 text-emerald-400" />
              <span>Leoneth@loja.com</span>
            </li>
            <li className="flex items-start gap-3">
              <Phone className="h-4 w-4 text-emerald-400" />
              <span>+55 (63) 98410-7523</span>
            </li>
            <li className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-emerald-400" />
              <span>R. Maranhense, 359, Sítio Novo do Tocantins - TO, 77940-000</span>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-200">Redes sociais</h3>
          <p className="mt-4 text-sm text-slate-300">Acompanhe lançamentos, bastidores e ofertas exclusivas.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link className="flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm text-slate-100 transition hover:border-emerald-400 hover:text-white" href="https://instagram.com" target="_blank">
              <Instagram className="h-4 w-4" /> Instagram
            </Link>
            <Link className="flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm text-slate-100 transition hover:border-emerald-400 hover:text-white" href="https://facebook.com" target="_blank">
              <Facebook className="h-4 w-4" /> Facebook
            </Link>
            <Link className="flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm text-slate-100 transition hover:border-emerald-400 hover:text-white" href="https://wa.me/+5563984107523" target="_blank">
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-6 text-center text-xs text-slate-400">
        © {year} Leonete Modas. Todos os direitos reservados.
      </div>
    </footer>
  );
}