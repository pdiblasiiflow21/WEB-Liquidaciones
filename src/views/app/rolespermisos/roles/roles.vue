<template>
  <div>
    <list-view
      ref="listView"
      resource="role"
      :onBeforeSave="onBeforeSave"
      :customValidations="customValidations"
      :showActions="true"
      :showEdit="true"
      :showDelete="true"
    >
      <template slot="title"> Roles </template>

      <template slot="columns">
        <!-- <column field="id" title="Id" width="40" /> -->
        <column field="name" title="Nombre" />
        <column field="description" title="Descripción" />
      </template>
      <!-- FORMULARIO ALTA -->
      <template slot="modal-form" slot-scope="props">
        <!-- CODIGO -->
        <b-form-group label="Nombre">
          <b-form-input
            v-model="props.form.entity.name"
            placeholder="Nombre"
            :state="$isValid(props.form.$v.form.entity.name)"
          />
          <b-form-invalid-feedback>Ingrese el nombre</b-form-invalid-feedback>
        </b-form-group>
        <!-- DESCRIPCION -->
        <b-form-group label="Descripcion">
          <b-form-input
            v-model="props.form.entity.description"
            placeholder="Descripcion"
          />
          <b-form-invalid-feedback
            >Ingrese la Descripcion</b-form-invalid-feedback
          >
        </b-form-group>
        <!-- COMPANIA -->
      </template>
    </list-view>
  </div>
</template>

<script>
const { required } = require("vuelidate/lib/validators");

export default {
  data() {
    return {
      customValidations: {
        name: { required },
      },
    };
  },
  methods: {
    onBeforeSave(form) {
      let result = { hasErrors: false, messages: [] };
      //add validations here
      result.hasErrors = result.messages.length > 0;

      //apply custom logic here

      return Promise.resolve(result);
    },
  },
};
</script>


<style>
.invalid-feedback.show {
  display: block;
}
</style>