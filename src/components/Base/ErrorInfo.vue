<template>
    <b-alert  show variant="danger" v-if="show" style="margin-top: 10px;">
        <p class="font-weight-bold">Error:</p>
        <p class="error-item" v-for="(message,index) in messages" :key="index" >
            {{ message }}
        </p>
    </b-alert>  
</template>

<script>
    export default {
        name: 'ErrorInfo',
        props: {
            messages: {
                type: Array,
                required: true,
                default: function () {
                    return [];
                }
            },
            show: {
                type: Boolean,
                required: false,
                default: function () {
                    return false;
                }
            }
        }
    };
</script>

<style>
    .error-item {
        margin-bottom: 0;
    }
</style>
