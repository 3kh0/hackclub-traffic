export default defineNuxtPlugin(() => {
  const { mode } = useColorMode()
  mode.value = document.documentElement.dataset.mode === 'dark' ? 'dark' : 'light'
})
