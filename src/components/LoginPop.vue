<template>
  <div class="modal-backdrop">
    <div class="modal">
      <h3>Enter Login Code</h3>

      <input
        v-model="code"
        class="codeInput"
        placeholder="Enter code"
      />

      <div class="modal-actions">
        <button class="button" @click="onSubmit">Submit</button>
        <button class="button" @click="$emit('close')">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"

const code = ref("")

const emit = defineEmits<{
  (e: "success", token: string): void
  (e: "close"): void
}>()

async function onSubmit() {
  if (!code.value) {
    alert("Please enter a code")
    return
  }
  try {
    const res = await fetch("php/llamaLogin.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "any",password: code.value }),
    })
    if (!res.ok) throw new Error("Invalid code")
    const data = await res.json()
    if (data.token) {
      emit("success", data.token)
    } else {
      throw new Error("No token returned")
    }
  } catch (err: any) {
    alert(err.message || "Login failed")
  }
}
</script>
