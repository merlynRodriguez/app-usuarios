# Junta Vecinal Bolívar - Sistema de Agua Potable

Aplicación web progresiva (PWA) para la consulta y pago de consumo de agua potable, diseñada con un enfoque mobile-first.

## Stack Tecnológico

- **Frontend:** React + Vite
- **Estilos:** Tailwind CSS
- **Iconos:** Lucide React
- **Backend:** Supabase (Cliente JS)
- **PWA:** vite-plugin-pwa (Service Worker, Manifest, Offline support)

## Estructura del Proyecto

- `src/components`: Componentes reutilizables (Header, Modal de Pago).
- `src/supabaseClient.js`: Configuración del cliente de Supabase.
- `src/App.jsx`: Lógica principal, gestión de estado y vistas.
- `src/index.css`: Estilos globales y configuración de Tailwind.
- `vite.config.js`: Configuración de Vite y PWA.

## Requisitos Previos

- Node.js instalado (v14 o superior).

## Instalación y Ejecución

1.  **Instalar dependencias:**
    ```bash
    npm install
    ```

2.  **Correr en desarrollo:**
    ```bash
    npm run dev
    ```
    La aplicación estará disponible en `http://localhost:5173`.

3.  **Construir para producción:**
    ```bash
    npm run build
    ```

4.  **Previsualizar producción:**
    ```bash
    npm run preview
    ```

## Funcionalidades

- **Búsqueda de Usuario:** Ingrese "merlyn" o "willy" para ver su historial.
- **Historial de Consumo:** Muestra los últimos 6 registros con estado de pago.
- **Simulación de Pago:**
    - Pago individual por mes.
    - "Pagar Todo" para saldar la deuda total.
    - Generación de QR simulado y confirmación visual.
- **Noticias:** Barra inferior con novedades.
- **Modo PWA:** Instalable en dispositivos Android/iOS y funciona offline (caché de UI).

## Configuración de Supabase

Las credenciales están configuradas en el archivo `.env`. La aplicación espera una estructura de base de datos con tablas separadas por usuario (`merlyn`, `willy`) y una tabla principal `agua`.
