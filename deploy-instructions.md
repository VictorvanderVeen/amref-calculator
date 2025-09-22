# Amref Nalatenschap Calculator - Deployment Opties

## Quick Share Opties

### 1. GitHub Pages (Gratis & Snel)
```bash
# Maak een GitHub repository
# Upload beide HTML bestanden
# Ga naar Settings > Pages
# Selecteer main branch
# Calculator wordt beschikbaar op: https://username.github.io/repository-name/
```

### 2. Netlify Drop (Instant Deploy)
- Ga naar netlify.com/drop
- Sleep beide HTML bestanden in de drop zone
- Krijg direct een live URL
- Perfecte preview voor Amref team

### 3. Vercel (Professioneel)
```bash
npx vercel --prod
# Follow prompts voor instant deployment
```

## Voor Amref Implementatie

### Iframe Embed Code
```html
<iframe
    src="https://your-domain.com/amref-nalatenschap-calculator.html"
    width="100%"
    height="800"
    frameborder="0"
    title="Amref Nalatenschap Impact Calculator"
    loading="lazy"
    style="border: none; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
</iframe>
```

### WordPress Integratie
1. Upload HTML bestand naar WordPress media library
2. Gebruik Custom HTML block
3. Embed via iframe of direct HTML

### Direct op Amref Server
- Upload `amref-nalatenschap-calculator.html` naar hun webserver
- Link: `https://amref.nl/nalatenschap-calculator`
- Embed op bestaande pagina met iframe

## Aanpassingen voor Productie

### Form Endpoint
Vervang in JavaScript (regel ~320):
```javascript
// Replace with actual Amref endpoint
fetch('https://amref.nl/api/nalatenschap-leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
})
```

### Google Analytics
Voeg Amref's GA tracking code toe in `<head>`:
```html
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-XXXXXXX');</script>
```

## Share Checklist voor Amref

- [ ] Demo URL actief
- [ ] Mobile responsive getest
- [ ] Form validatie werkt
- [ ] Impact verhalen correct
- [ ] GDPR compliance
- [ ] Iframe embedding getest
- [ ] Analytics events configured
- [ ] Cross-browser compatibility
- [ ] Accessibility features
- [ ] Performance optimized

## Contact Informatie
- Calculator files: `amref-nalatenschap-calculator.html` + `iframe-test.html`
- Technische vragen: Beschikbaar voor support
- Aanpassingen: Eenvoudig te implementeren