<template>
  <div>
    <list-view
      resource="monedas"
      :onBeforeSave="onBeforeSave"
      :customValidations="customValidations"
      :showActions="true"
      :showEdit="true"
      :showDelete="true"
    >
      <template slot="title"> Monedas </template>
      <template slot="columns">
        <column field="id" title="Id" width="40" />
        <column field="nombre" title="Nombre" />
        <column field="decimales" title="Decimales" />
        <!-- <column field="valor" title="Valor" />     -->
        <column field="abreviatura" title="Abreviatura" />
      </template>
      <template slot="modal-form" slot-scope="props">
        <b-form-group label="Nombre">
          <br />
          <b-form-input
            v-model="props.form.entity.nombre"
            placeholder="Nombre"
            :state="$isValid(props.form.$v.form.entity.nombre)"
          />
          <b-form-invalid-feedback>Ingrese el nombre</b-form-invalid-feedback>
          <br />
        </b-form-group>
        <b-form-group label="Decimales">
          <b-form-input
            v-model="props.form.entity.decimales"
            placeholder="Decimales"
            :state="$isValid(props.form.$v.form.entity.decimales)"
          />
          <b-form-invalid-feedback>Ingrese el nombre</b-form-invalid-feedback>

          <br />
        </b-form-group>
          <!-- <b-form-input  v-model="props.form.entity.valor" placeholder="Valor" :state="$isValid(props.form.$v.form.entity.valor)" />
                    <b-form-invalid-feedback>Ingrese el nombre</b-form-invalid-feedback> -->

          <b-form-group label="Abreviatura">
          <b-form-input
            v-model="props.form.entity.abreviatura"
            placeholder="Abreviatura"
            :state="$isValid(props.form.$v.form.entity.abreviatura)"
          />
          <b-form-invalid-feedback>Ingrese el nombre</b-form-invalid-feedback>
          <br />
        </b-form-group>
        
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
        nombre: { required },
        decimales: { required },
        valor: 1,
        abreviatura: { required },
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