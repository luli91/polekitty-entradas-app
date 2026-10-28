# 🎟️ PoleKitty - Panel de Control y Entradas

Sistema de gestión de entradas, control de pagos y acceso en puerta para la Muestra Anual **PoleKitty**.

## 🚀 Tecnologías Utilizadas

* **Framework:** [Next.js](https://nextjs.org/) (App Router)
* **Estilos:** [Tailwind CSS](https://tailwindcss.com/)
* **Base de datos / Tiempo Real:** [Supabase](https://supabase.com/)
* **Iconos:** [Lucide React](https://lucide.dev/)

---

## ✨ Funcionalidades Principales

* **Panel de Administrador (Protegido por contraseña):**
  * Visualización de todos los espectadores registrados y las bailarinas a las que vienen a ver.
  * **Gestión de Pagos:** Botones interactivos para alternar entre estados *Pendiente* y *Aprobado*.
  * **Control de Puerta en Tiempo Real:** Marcar asistencia (*Presente* / *Ausente* / *Ingresado*).
  * **Sincronización en vivo:** Actualización automática vía WebSockets de Supabase ante cualquier cambio de estado.

* **Optimización para Impresión:**
  * Listado limpio de asistentes con pagos aprobados.
  * Ocultamiento automático de elementos de interfaz y pagos pendientes al mandar a imprimir.
  * Casilleros físicos impresos `[ ] Presente` y `[ ] Ausente` para control manual en la entrada del teatro.

* **Sección de Votación / Teatro:**
  * Acceso al QR oficial para las mesas de votación en vivo de la app de performance.

---

## 📂 Estructura del Proyecto

```text
src/
├── app/
│   ├── admin/          # Panel de control de entradas y puerta
│   ├── mi-entrada/     # Visualización de entrada de espectador
│   └── page.tsx        # Página de registro y compra de entradas
└── lib/
    └── supabase.ts     # Configuración del cliente de Supabase
⚙️ Configuración e Instalación Local
Clonar el repositorio:

Bash
git clone [https://github.com/luli91/polekitty-entradas-app.git](https://github.com/luli91/polekitty-entradas-app.git)
Instalar dependencias:

Bash
npm install
Crear un archivo .env.local en la raíz con tus credenciales de Supabase:

Fragmento de código
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
Ejecutar el servidor de desarrollo:

Bash
npm run dev
Abrir http://localhost:3000 en tu navegador.