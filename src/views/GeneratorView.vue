<template>
  <div class="generator-container">
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Generando tu página web...</p>
    </div>
    
    <div v-else-if="error" class="error-state">
      <h2>Error</h2>
      <p>{{ error }}</p>
      <button @click="retry" class="retry-button">Reintentar</button>
    </div>
    
    <div v-else-if="generatedHtml" class="generated-content" v-html="generatedHtml"></div>
    
    <div v-else class="no-content">
      <p>No se pudo generar el contenido. Intenta con otro prompt.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const loading = ref(true)
const error = ref(null)
const generatedHtml = ref('')

const crearPromptDeLandingPage = (tema) => {
  return `Por favor, genera el código HTML completo de una landing page moderna y atractiva sobre: "${tema}". 
  La página debe incluir:
  1. Un header con menú de navegación
  2. Una sección hero con un título llamativo
  3. Al menos 3 secciones de características o beneficios
  4. Un footer con información de contacto
  
  Requisitos técnicos:
  - Usa HTML5 semántico
  - Incluye estilos CSS en línea (inline) o en una etiqueta <style>
  - Hazla completamente responsiva
  - No incluyas JavaScript
  - El diseño debe ser moderno y profesional
  - Usa colores atractivos y apropiados para el tema
  - Asegúrate de que el HTML sea válido y esté bien formateado
  
  Solo devuelve el código HTML, sin comentarios adicionales.`
}

const generatePage = async () => {
  try {
    loading.value = true
    error.value = null
    
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY
    if (!apiKey) {
      throw new Error('No se encontró la API key de Google Gemini. Por favor, configura tu API key en el archivo .env.local')
    }
    
    const prompt = route.params.prompt
    if (!prompt) {
      throw new Error('No se proporcionó un prompt en la URL')
    }
    
    const fullPrompt = crearPromptDeLandingPage(prompt)
    
    const requestBody = {
      contents: [{
        parts: [{
          text: fullPrompt
        }]
      }],
      generationConfig: {
        temperature: 0.9,
        topK: 1,
        topP: 1,
        maxOutputTokens: 2048,
        stopSequences: []
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
      ]
    }
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      }
    )
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error?.message || 'Error al generar el contenido')
    }
    
    const data = await response.json()
    generatedHtml.value = data.candidates[0].content.parts[0].text
    
  } catch (err) {
    console.error('Error al generar la página:', err)
    error.value = err.message || 'Ocurrió un error al generar la página. Por favor, inténtalo de nuevo.'
  } finally {
    loading.value = false
  }
}

const retry = () => {
  generatePage()
}

onMounted(() => {
  generatePage()
})
</script>

<style scoped>
.generator-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  font-family: Arial, sans-serif;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-state {
  text-align: center;
  color: #e74c3c;
  max-width: 600px;
  padding: 2rem;
  background-color: #fdecea;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.retry-button {
  margin-top: 1rem;
  padding: 0.5rem 1.5rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s;
}

.retry-button:hover {
  background-color: #2980b9;
}

.generated-content {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.no-content {
  text-align: center;
  color: #7f8c8d;
  padding: 2rem;
}
</style>
