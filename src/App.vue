<script lang="ts">
    export const description = 'An inset sidebar with secondary navigation.'
    export const iframeHeight = '800px'
</script>

<script setup lang="ts">
    import AppSidebar from '@/components/AppSidebar.vue'
    import {
        Breadcrumb,
        BreadcrumbItem,
        BreadcrumbLink,
        BreadcrumbList,
        BreadcrumbPage,
        BreadcrumbSeparator,
    } from '@/components/ui/breadcrumb'
    import {
        Separator
    } from '@/components/ui/separator'
    import {
        SidebarInset,
        SidebarProvider,
        SidebarTrigger,
    } from '@/components/ui//sidebar'
</script>

<template>
    <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
            <header class="flex h-16 shrink-0 items-center gap-2 bg-blue-900 text-white shadow-lg border-b-4 border-yellow-400">
                <div class="flex items-center gap-2 px-4">
                    <SidebarTrigger class="-ml-1 text-white hover:bg-blue-800" />
                    <Separator orientation="vertical" class="mr-2 h-4 bg-blue-700" />
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem class="hidden md:block">
                                <BreadcrumbLink href="#" class="text-blue-100 hover:text-white font-medium">
                                    MINOIL S.A.
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator class="hidden md:block text-blue-300" />
                            <BreadcrumbItem>
                                <BreadcrumbPage class="text-yellow-300 font-semibold">ERP - Recursos Humanos</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
                <div class="ml-auto mr-4">
                    <div class="bg-yellow-400 text-blue-900 px-3 py-1 rounded-full text-sm font-semibold">
                        Sistema Activo
                    </div>
                </div>
            </header>

            <div class="p-6 flex-1 bg-gray-50 min-h-screen">
                <RouterView />
            </div>
        </SidebarInset>
    </SidebarProvider>
</template>
