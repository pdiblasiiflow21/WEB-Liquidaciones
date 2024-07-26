<template>
  <div class="error-message">
    <b-modal id="myModal" title="Error">
      <template #modal-footer="{ ok }">
        <b> {{ messageText }}</b>
        <b-button size="sm" variant="outline-danger" @click="ok()">
          Aceptar
        </b-button>
      </template>
    </b-modal>
  </div>
</template>

<script>
export default {
  name: "ErrorMessage",
  data() {
    return {
      messageText: "",
      mustShow: false,
    };
  },
  props: {},
  methods: {
    showError(error) {
      if (error.data?.Message && error.data?.Message != "") {        
        if (error.data) {
          this.messageText = error.data.Message;
          this.mustShow = true;
        }        
      } else if (error != null && error != "") {
        var err = JSON.stringify(error);

        if (err.substring(0, 5) == '{"url') {
          this.messageText = "Error de conexión";
        } else {
          this.messageText = error;
        }

        this.mustShow = true;
      } else if (error.data == null || error == null) {
        this.messageText = "Error desconocido";
        this.mustShow = true;
      }

      if (this.mustShow && this.messageText != "") {
        this.$bvModal.show("myModal");
        this.mustShow = false;
      }
    },
  },
};
</script>

<style>
</style>