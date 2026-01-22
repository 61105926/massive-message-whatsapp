<script setup lang="ts">
import { onMounted, ref } from 'vue'
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

// Cargar versión para mostrar en el footer
const version = ref<string | null>(null)

const loadVersion = async () => {
  try {
    const response = await fetch(`/version.json?t=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      version.value = data.version
    }
  } catch (error) {
    console.warn('No se pudo cargar la versión:', error)
  }
}

onMounted(() => {
  loadVersion()
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
            <div v-if="version" class="px-2 py-1.5 text-xs text-muted-foreground border-t mt-2">
                <div class="flex items-center justify-center gap-1.5">
                    <span class="text-[10px] opacity-70">v</span>
                    <span class="font-mono text-[10px]">{{ version.substring(0, 8) }}</span>
                </div>
            </div>
        </SidebarFooter>
    </Sidebar>
</template>
