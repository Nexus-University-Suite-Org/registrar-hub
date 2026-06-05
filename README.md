# Academic Portal

A modern, customizable academic management system built with React and TypeScript. This open-source application allows institutions to manage students, lecturers, courses, results, and more.

## Features

- **Student Management**: Add, edit, and track student records
- **Lecturer Management**: Manage teaching staff and course assignments
- **Course Management**: Create and organize academic courses
- **Results & Transcripts**: Handle grades and academic records
- **Dashboard & Reports**: Analytics and reporting tools
- **Customizable Branding**: Fully customizable site name, logo, and colors

## Customization

This application is designed to be easily customizable for different institutions. You can customize:

- **Site Name**: Change the portal name throughout the application
- **Logo**: Upload a custom logo image
- **Primary Color**: Adjust the color scheme
- **Meta Description**: Update SEO descriptions

### How to Customize

1. **Via the Web Interface**:
   - Log in to the application
   - Navigate to Settings > Branding
   - Update the site name, upload a logo, and adjust colors
   - Changes are applied immediately (stored in the configured backend)

### Branding Configuration

The branding settings are stored in Firestore under `settings/branding` with the following structure:

```json
{
  "siteName": "Your Institution Portal",
  "logoUrl": "https://your-storage-url/logo.png",
  "faviconUrl": "",
  "primaryColor": "hsl(24, 100%, 50%)",
  "metaDescription": "Manage your academic records...",
  "ogImageUrl": ""
}
```

### Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd academic-portal
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Build for production:

```bash
npm run build
```

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI**: Tailwind CSS, Shadcn/ui
  -- **Backend**: Configurable (this repo includes a local shim; replace with Supabase, an API, or your own backend)
- **State Management**: React Query
- **Icons**: Lucide React

## Contributing

This is an open-source project. Feel free to contribute by:

- Reporting bugs
- Suggesting features
- Submitting pull requests
- Improving documentation

## License

MIT License - feel free to use this for your institution!

- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
