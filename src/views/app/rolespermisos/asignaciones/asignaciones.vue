<template>
  <b-container>
    <br />
    <h1>Asignaciones</h1>
    <br />
    <br />
    <br />
    <br />
    <h5>Usuarios</h5>
    <div>
      <b-form-select
        v-model="selectedUser"
        :options="users"
        size="sm"
        class="mt-3"
        @change="onChangeUser($event)"
      ></b-form-select>
    </div>
    <br />
    <h3>Roles</h3>
    <!-- ------------------------------------------------ -->

    <!-- MODAL -->
    <div>
      <b-modal id="modal-1" title="Confirma que quiere realizar esta accion?">
        <p>Esta accion modificara el rol asignado al usuario seleccionado.</p>
        <template #modal-footer="{ ok, cancel }">
          <b-button size="sm" variant="secondary" @click="cancel()">
            Cancelar
          </b-button>
          <b-button class="mr-1" size="sm" variant="primary" @click="habilitarRol(); ok();">
            {{ modalMessage.text }}
          </b-button>
        </template>
      </b-modal>
    </div>
    
    <!-- ------------------------------------------------ -->

    <!-- MODAL ERROR  -->
    <div>
      <b-modal id="modal-error" title="Error">
        <template #modal-footer="{ ok }">
          <b> {{ errorGenerado }}</b>
          <b-button size="sm" variant="outline-danger" @click="ok()">
            Aceptar
          </b-button>
        </template>
      </b-modal>
    </div>

    <!-- TABLE ROLES -->
    <div>
      <b-table
        hover
        head-variant="light"
        table-variant="Primary"
        responsive="sm"
        :items="roles"
        :fields="rolesFields"
      >
        <template #cell(actions)="bData">
          <b-button variant="outline-primary" @click="update(bData)">{{
            bData.item.state
          }}</b-button>
        </template>
        <template #cell(estado)="data">
          <b-alert variant="success" v-if="data.item.state != 'Habilitar'" show
            >Habilitado</b-alert
          >
          <b-alert variant="danger" v-if="data.item.state == 'Habilitar'" show
            >Deshabilitado</b-alert
          >
        </template>
      </b-table>
    </div>

    <br />
  </b-container>
  <!-- ------------------------------------------------ -->
</template>

<script>
import moment from "moment";
import store from "../../../../store";
import apiServices from "../../../../api-services";
import { mapActions } from "vuex";

export default {
  data() {
    return {
      modalMessage: { text: " ", userId: "" },
      rolesFields: [
        // {key:"id"},
        { key: "nombre" },

        "estado",
        "actions",
      ],

      roles: [],
      errorGenerado: "",
      users: [],
      selectedUser: null,
      selectedRole: { roles: [] },
    };
  },
  methods: {
    update(data) {
      this.selectedRole = { roles: [] };
      this.selectedRole.roles.push(data.item.id);
      this.modalMessage.text = data.item.state;
      this.$bvModal.show("modal-1");
    },
    onChangeUser: function (event) {
      var _this = this;
      _this.selectedUser = event;
      this.getRoles()
        .then(function (response) {
          _this.roles = response.data; // #1
        })
        .catch(function (error) {
          _this.showError(error);
        });
    },
    showError(error) {
      this.errorGenerado = error;
      this.$bvModal.show("modal-error");
    },
    getRoles: function () {
      return apiServices.get("asignacion/roles/users/" + this.selectedUser);
    },

    getUsers: function () {
      return apiServices.get("asignacion/users");
    },
    habilitarRol: function () {
      if (this.modalMessage.text == "Habilitar") {
        var result = apiServices.create(
          "asignacion/users/" + this.selectedUser + "/roles",
          this.selectedRole
        );
      } else {
        var result = apiServices.update(
          "asignacion/users/" + this.selectedUser + "/roles",
          this.selectedRole
        );
      }
      var _this = this;
      this.getRoles()
        .then(function (response) {
          _this.roles = response.data; // #1
        })
        .catch(function (error) {
          _this.showError(error);
        });
    },
  },

  mounted: function () {
    var _this = this;

    this.getUsers()
      .then(function (response) {
        _this.$data.users = response.data; // #1
      })
      .catch(function (error) {
        _this.showError(error);
      });
  },
};
</script>

<style >
</style>