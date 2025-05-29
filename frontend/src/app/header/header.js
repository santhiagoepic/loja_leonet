import Link from "next/link";
import Image from "next/image";

export function Header() {
  return (
    <header className="bg-yellow-600 shadow-sm">
      <div className="container mx-auto px-4 py-6">
        {/* Container principal em coluna */}
        <div className="flex flex-col items-center space-y-4">
          
        
         <div className="relative w-40 h-20"> 
            <Image
              src="/logodeleonete.png"
              alt="Leonete Modas"
              fill
              className="object-contain" 
              priority 
            />
          </div>

          {/* Botões centralizados */}
          <div className="flex items-center space-x-4">
            <div className="text-black">
            <Link href="/">
              <button className="text-sm relative font-semibold px-2 py-1 hover:after:w-full after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 after:bg-black after:transition-all after:duration-300">
                Home
              </button>
            </Link>

            <Link href="/masculino">
              <button className="text-sm relative font-semibold px-2 py-1 hover:after:w-full after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 after:bg-black after:transition-all after:duration-300">
                Masculino
              </button>
            </Link>

            <Link href="/feminino">
              <button className="text-sm relative font-semibold px-2 py-1 hover:after:w-full after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 after:bg-black after:transition-all after:duration-300">
                Feminino
              </button>
            </Link>

<Link href="/infantil">
              <button className="text-sm relative font-semibold px-2 py-1 hover:after:w-full after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 after:bg-black after:transition-all after:duration-300">
                Infantil
              </button>
            </Link>

  <Link href="/acessorios">
              <button className="text-sm relative font-semibold px-2 py-1 hover:after:w-full after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 after:bg-black after:transition-all after:duration-300">
                Acessorios
              </button>
            </Link>

<Link href="/contato">
              <button className="text-sm relative font-semibold px-2 py-1 hover:after:w-full after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 after:bg-black after:transition-all after:duration-300">
                Contato
              </button>
            </Link>

          

          </div>
        </div>
      </div>
      </div>
    </header>
  );
}