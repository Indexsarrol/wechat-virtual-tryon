<template>
  <section>
    <el-table :data="rows">
      <el-table-column label="任务状态" prop="status" />
      <el-table-column label="失败原因" prop="failReason" />
    </el-table>
  </section>
</template>

<script setup lang="ts">
const rows = [
  { status: "success", failReason: "" },
  { status: "failed", failReason: "provider timeout" }
];
</script>
