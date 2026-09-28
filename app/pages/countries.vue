<template>
  <BreakdownPage label="Country" endpoint="/api/countries" data-key="countries" name-key="country" />
</template>

<script setup lang="ts">
useHead({ title: 'Countries' })
</script>
