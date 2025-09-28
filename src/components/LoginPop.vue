<template>
  <div class="modal-backdrop">
    <div class="modal">
      <h3>Anmelden</h3>

      <input
        v-model="username"
        class="codeInput"
        placeholder="Namen"
      />
      <input
        v-model="code"
        class="codeInput"
        placeholder="Passwort"
      />

      <div class="modal-actions">
        <button class="button" @click="onSubmit">Absenden</button>
        <button class="button" @click="$emit('close')">Abbrechen</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"

const username = ref("")
const code = ref("")

const emit = defineEmits<{
  (e: "success", token: string): void
  (e: "close"): void
}>()

async function onSubmit() {
  if (!code.value) {
    alert("Bitte Passwort eingeben")
    return
  }
  try {
    const user = username.value? username.value.trim() : "any"
    const res = await fetch("php/llamaLogin.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: user, password: code.value }),
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
