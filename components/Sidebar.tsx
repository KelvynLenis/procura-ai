"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { account } from "@/lib/appwrite";
import {
  Bell,
  ChartColumnBig,
  FileWarning,
  Home,
  LogOut,
  Pencil,
  Siren,
  Smartphone,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { CustomSidebarTrigger } from "./CustomSidebarTrigger";
import { IoMdAddCircle } from "react-icons/io";
import { PiUsersThreeFill } from "react-icons/pi";
import { useState } from "react";
import { LoadingToast } from "./LoadingToast";
import { toast } from "react-toastify";
import logo from "../assets/icons/logo-text-2.svg";
// import logo from '../assets/icons/logo-text.svg'
import Image from "next/image";
import { RiAlarmWarningFill } from "react-icons/ri";

const devicesGroup = [
  {
    title: "Meus dispositivos",
    url: "meus-dispositivos",
    icon: <Smartphone />,
  },
  {
    title: "Cadastrar novo dispositivo",
    url: "cadastrar-dispositivo",
    icon: (
      <div className="relative">
        <Smartphone className="size-4" />
        <IoMdAddCircle className="absolute -right-0.5 top-0.5 size-3 rounded-full bg-white" />
      </div>
    ),
  },
];

const securityGroup = [
  {
    title: "Contatos de confiança",
    url: "contatos-de-confianca",
    icon: <PiUsersThreeFill />,
  },
  // {
  //   title: 'Editar perfil',
  //   url: 'perfil',
  //   icon: <Pencil />,
  // },
];

const itemsForAdmins = [
  {
    title: "Dashboard",
    url: "dashboard",
    icon: <ChartColumnBig />,
  },
  {
    title: "Usuários cadastrados",
    url: "usuarios",
    icon: <PiUsersThreeFill />,
  },
  {
    title: "Dispositivos notificados",
    url: "dispositivos-notificados",
    icon: <RiAlarmWarningFill />,
  },
  {
    title: "Gerenciar notificações",
    url: "gerenciar-notificacoes",
    icon: <Bell />,
  },
];

const perfilGroup = [
  {
    title: "Editar perfil",
    url: "perfil-admin",
    icon: <Pencil />,
  },
];

interface SidebarProps {
  admin?: boolean;
}

export function AppSidebar({ admin }: SidebarProps) {
  const [isLoading, setIsLoading] = useState(true);
  const { isMobile, toggleSidebar } = useSidebar();
  const router = useRouter();

  const pathname = usePathname().slice(1);

  async function logout() {
    try {
      const idToken = localStorage.getItem('govbr_id_token') || '';
      
      // 1. Deletar sessão do Appwrite
      await account.deleteSession("current");
      
      // 2. Limpar todos os dados locais
      localStorage.clear();
      sessionStorage.clear();
      document.cookie.split(";").forEach((c) => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      
      const ssoBaseUrl = process.env.NEXT_PUBLIC_GOVBR_SSO_URL;
      const realm = process.env.NEXT_PUBLIC_GOVBR_REALM;
      const redirectUri = encodeURIComponent(`${window.location.origin}/login`);
      
      // 3. Fazer logout silencioso no Keycloak
      const logoutKeycloak = `${ssoBaseUrl}realms/${realm}/protocol/openid-connect/logout?id_token_hint=${idToken}&post_logout_redirect_uri=${redirectUri}`;
      
      try {
        await fetch(logoutKeycloak, { method: 'GET', mode: 'no-cors' });
      } catch (error) {
        console.error('Erro ao fazer logout no Keycloak:', error);
      }
      
      // 4. Redirecionar para logout do Gov.br (staging para homologação)
      window.location.href = `https://sso.acesso.gov.br/logout?post_logout_redirect_uri=${redirectUri}`;
      
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      localStorage.clear();
      sessionStorage.clear();
      setTimeout(() => window.location.href = "/login", 1000);
    }
  }

  function showLoadingToast(url: string) {
    setIsLoading(true);
    isMobile && toggleSidebar();
    toast(<LoadingToast isReactToastifyComponent />, {
      autoClose: 1000,
      hideProgressBar: true,
      position: "top-center",
      closeOnClick: true,
    });
    router.push(`${process.env.NEXT_PUBLIC_BASE_URL}/${url}`);
  }

  return (
    <>
      <Sidebar
        collapsible="icon"
        className="z-[1] hidden h-full text-zinc-900 shadow-md lg:block"
      >
        <CustomSidebarTrigger />
        <SidebarContent className="flex flex-col bg-white">
          <div className="flex h-40 w-full flex-col items-center justify-center gap-1">
            <Image src={logo} alt="logo" className="" />
            <span className="h-0.5 w-[90%] rounded-lg bg-zinc-300" />
          </div>

          {/* {
            !admin && (
              <SidebarGroup className="flex px-2">
                <SidebarMenu className="flex flex-col gap-1 font-bold">
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === 'home'}>
                      <button onClick={() => showLoadingToast('/home')}>
                        <Home />
                        <span>Início</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroup>
            )
          } */}

          <SidebarGroup className="flex flex-col gap-2 px-2">
            <SidebarGroupLabel className="uppercase">
              {admin ? "Gerenciamento" : "Dispositivos"}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="flex flex-col gap-1 font-bold">
                {admin
                  ? itemsForAdmins.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === item.url}
                        >
                          <button
                            type="button"
                            onClick={() => showLoadingToast(item.url)}
                          >
                            {pathname === item.url && (
                              <span className="absolute left-0 h-full w-0.5 rounded-xl bg-secondary" />
                            )}
                            {item.icon}
                            <span>{item.title}</span>
                          </button>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))
                  : devicesGroup.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === item.url}
                        >
                          <button
                            type="button"
                            onClick={() => showLoadingToast(item.url)}
                          >
                            {pathname === item.url && (
                              <span className="absolute left-0 h-full w-0.5 rounded-xl bg-secondary" />
                            )}
                            {item.icon}
                            <span>{item.title}</span>
                          </button>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup className="flex flex-col gap-2">
            <SidebarGroupLabel className="uppercase">
              {admin ? "Perfil" : "Segurança"}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="flex flex-col gap-1 font-bold">
                {admin
                  ? perfilGroup.map((item) => (
                      <SidebarMenuItem key={item.title} title="Em breve">
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === item.url}
                        >
                          <button
                            type="button"
                            onClick={() => showLoadingToast(item.url)}
                          >
                            {item.icon}
                            <span>{item.title}</span>
                          </button>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))
                  : securityGroup.map((item) => (
                      <SidebarMenuItem key={item.title} title="Em breve">
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === item.url}
                        >
                          <button
                            type="button"
                            onClick={() => showLoadingToast(item.url)}
                          >
                            {item.icon}
                            <span>{item.title}</span>
                          </button>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}

                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <button
                      type="button"
                      onClick={logout}
                      className="flex gap-1 self-start text-red-500"
                    >
                      <LogOut />
                      Sair
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </>
  );
}
