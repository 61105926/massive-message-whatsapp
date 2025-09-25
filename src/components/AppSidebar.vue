<script setup lang="ts">
import {
    Home,
    FileText,
    MessageSquare,
    TrendingUp,
    Calendar,
    Bot,
    HelpCircle
} from 'lucide-vue-next'

// @ts-ignore
import NavMain from './NavMain.vue'
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
        navMain: [
            {
                title: 'Dashboard',
                url: '/admin/dashboard',
                icon: Home,
                isActive: true
            },
            {
                title: 'Boletas Masivas',
                url: '/admin/mass-payslips',
                icon: FileText,
                isActive: false
            },
            {
                title: 'Mensajes Masivos',
                url: '/mensajes/massive',
                icon: MessageSquare,
                isActive: false
            },
            {
                title: 'Clima Laboral',
                url: '/clima',
                icon: TrendingUp,
                isActive: false
            },
            {
                title: 'Vacaciones',
                url: '/vacaciones',
                icon: Calendar,
                isActive: false
            }
        ],
        navSecondary: [
            {
                title: 'Bot WhatsApp',
                url: '#',
                icon: Bot
            },
            {
                title: 'Soporte',
                url: '#',
                icon: HelpCircle
            }
        ]
    }
</script>

<template>
    <Sidebar v-bind="props">
        <SidebarHeader>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton size="lg" as-child>
                        <a href="#">
                            <div class="flex aspect-square size-8 items-center justify-center rounded-lg">
                                <img :src="avatarImg" alt="MINOIL" class="w-full h-full object-cover rounded-lg" />
                            </div>
                            <div class="grid flex-1 text-left text-sm leading-tight">
                                <span class="truncate font-semibold">MINOIL S.A.</span>
                                <span class="truncate text-xs">Recursos Humanos</span>
                            </div>
                        </a>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
            <NavMain :items="data.navMain" />
            <NavSecondary :items="data.navSecondary" class="mt-auto" />
        </SidebarContent>
        <SidebarFooter>
            <NavUser :user="data.user" />
        </SidebarFooter>
    </Sidebar>
</template>
