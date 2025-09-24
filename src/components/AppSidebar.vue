<script setup lang="ts">
import {
    Frame,
    LifeBuoy,
    Map,
    PieChart,
    Send,
    SquareTerminal,
} from 'lucide-vue-next'

// @ts-ignore
import NavMain from './NavMain.vue'
// @ts-ignore
import NavProjects from './NavProjects.vue'
// @ts-ignore
import NavSecondary from './NavSecondary.vue'
// @ts-ignore
import NavUser from './NavUser.vue'
// @ts-ignore
import avatarImg from '@/assets/img/boot.png'

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    type SidebarProps,
} from '@/components/ui/sidebar'

const props = withDefaults(defineProps<SidebarProps>(), {
    variant: 'inset',
})

    const data = {
        user: {
            name: 'RRHH',
            email: 'rrhh@minoil.com.bo',
            avatar: avatarImg,
        },
        navMain: [{
                title: 'Dashboard Principal',
                url: '/admin/dashboard',
                icon: PieChart,
                isActive: true,
                items: [{
                        title: 'Tablero Ejecutivo',
                        url: '/admin/dashboard',
                    },
                    {
                        title: 'Métricas y KPIs',
                        url: '/admin/dashboard',
                    },
                ],

            },
            {
                title: 'Gestión de Personal',
                url: '#',
                icon: SquareTerminal,
                isActive: false,
                items: [{
                        title: 'Lista de Empleados',
                        url: '/admin/employees',
                    },
                    {
                        title: 'Boletas de Pago',
                        url: '/admin/payslips',
                    },
                    {
                        title: 'Envío de Boletas',
                        url: '/admin/mass-payslips',
                    },
                ],

            },
            {
                title: 'Comunicaciones',
                url: '#',
                icon: Send,
                isActive: false,
                items: [{
                        title: 'Mensajes Masivos',
                        url: '/message',
                    },
                    {
                        title: 'Notificaciones',
                        url: '/admin/bulk-messages',
                    },
                ],

            },
            {
                title: 'Clima Laboral',
                url: '#',
                icon: LifeBuoy,
                isActive: false,
                items: [{
                        title: 'Encuestas de Clima',
                        url: '/clima',
                    },
                    {
                        title: 'Análisis y Reportes',
                        url: '/clima',
                    },
                ],

            },
            {
                title: 'Reportes y Análisis',
                url: '#',
                icon: Map,
                isActive: false,
                items: [{
                        title: 'Logs del Sistema',
                        url: '/admin/logs',
                    },
                    {
                        title: 'Auditoría',
                        url: '/admin/logs',
                    },
                ],

            },
            // {
            //   title: 'Models',
            //   url: '#',
            //   icon: Bot,
            //   items: [
            //     {
            //       title: 'Genesis',
            //       url: '#',
            //     },
            //     {
            //       title: 'Explorer',
            //       url: '#',
            //     },
            //     {
            //       title: 'Quantum',
            //       url: '#',
            //     },
            //   ],
            // },
            // {
            //   title: 'Documentation',
            //   url: '#',
            //   icon: BookOpen,
            //   items: [
            //     {
            //       title: 'Introduction',
            //       url: '#',
            //     },
            //     {
            //       title: 'Get Started',
            //       url: '#',
            //     },
            //     {
            //       title: 'Tutorials',
            //       url: '#',
            //     },
            //     {
            //       title: 'Changelog',
            //       url: '#',
            //     },
            //   ],
            // },
            // {
            //   title: 'Settings',
            //   url: '#',
            //   icon: Settings2,
            //   items: [
            //     {
            //       title: 'General',
            //       url: '#',
            //     },
            //     {
            //       title: 'Team',
            //       url: '#',
            //     },
            //     {
            //       title: 'Billing',
            //       url: '#',
            //     },
            //     {
            //       title: 'Limits',
            //       url: '#',
            //     },
            //   ],
            // },
        ],
        navSecondary: [{
                title: 'Soporte Técnico',
                url: '#',
                icon: LifeBuoy,
            },
            {
                title: 'Configuración',
                url: '#',
                icon: Send,
            },
        ],
        projects: [{
                name: 'Administración',
                url: '#',
                icon: Frame,
            },
            {
                name: 'Control de Acceso',
                url: '#',
                icon: PieChart,
            },
            {
                name: 'Estado del Sistema',
                url: '#',
                icon: Map,
            },
        ],
    }
</script>

<template>
    <Sidebar v-bind="props">
        <SidebarHeader>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton size="lg" as-child>
                        <a href="#">
                            <div
                                class="flex aspect-square size-8 items-center justify-center rounded-lg overflow-hidden">
                                <img :src="avatarImg"  alt="Logo Minoil" class="w-full h-full object-cover" />
                            </div>
                            <div class="grid flex-1 text-left text-sm leading-tight">
                                <span class="truncate font-bold text-blue-900">MINOIL S.A.</span>
                                <span class="truncate text-xs text-yellow-600 font-medium">ERP Recursos Humanos</span>
                            </div>
                        </a>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
            <NavMain :items="data.navMain" />
            <NavProjects :projects="data.projects" />
            <NavSecondary :items="data.navSecondary" class="mt-auto" />
        </SidebarContent>
        <SidebarFooter>
            <NavUser :user="data.user" />
        </SidebarFooter>
    </Sidebar>
</template>
