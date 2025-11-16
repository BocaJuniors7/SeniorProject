<template>
  <section>
    <h1>Dashboard</h1>
    <p>You are logged in as: <strong>{{ user?.email }}</strong></p>
    <div style="margin-top:1rem;">
      <button @click="addDocExample">Add a Firestore doc</button>
      <button @click="uploadExample" style="margin-left:.5rem;">Upload to Storage</button>
    </div>
    <pre style="margin-top:1rem;">{{ message }}</pre>
  </section>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useUserStore } from '../stores/user'
import { addExampleDoc, uploadExampleFile } from '../firebase'

const userStore = useUserStore()
const { user } = storeToRefs(userStore)
const message = ref('')

async function addDocExample() {
  const ref = await addExampleDoc()
  message.value = 'Added doc with id: ' + ref.id
}

async function uploadExample() {
  const url = await uploadExampleFile(new Blob(['hello world'], { type: 'text/plain' }), 'hello.txt')
  message.value = 'Uploaded to: ' + url
}
</script>

<script>
import { ref } from 'vue'
export default {}
</script>
