<template>
    <div class="loader" v-if="visible">
        <div class="spinner-border text-primary"></div>
    </div>
</template>

<script>
    export default {
        name: 'Loading',
        props: {            
        },
        data() {
            return {
                visible: false                
            }
        },
        methods: {
            show() {
                this.visible = !this.visible;
            },
            hide(delay) {                
                setTimeout(() => this.visible = !this.visible, delay || 300);                
            }
        }
    };
</script>

<style>
    .loader {
        position: fixed;
        opacity:0.7;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        top: 0;
        left: 0;
        z-index:10000;
        background-color: lightgray;
    }
</style>
