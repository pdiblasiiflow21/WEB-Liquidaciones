<template>
  <b-container>
    <!-- Content here -->

    <br />
    <h1>Permisos</h1>
    <br />
    <br />
    <h3>Roles</h3>
    <div>
      <b-form-select
        v-model="selectedRole"
        :options="roles"
        size="sm"
        class="mt-3"
        @change="onChangeRoles($event)"
      ></b-form-select>
    </div>
    <br />

    <h3>Permisos</h3>

    <!-- MODAL -->
    <div>
      <b-modal id="modal-1" title="Confirma que quiere realizar esta accion?">
        <p>Esta accion modificara el permiso asignado al rol seleccionado.</p>
        <template #modal-footer="{ ok, cancel }">          
          <b-button size="sm" variant="secondary" @click="cancel()">
            Cancelar
          </b-button>
          <b-button
            class="mr-1"
            size="sm"
            variant="primary"
            @click="
              habilitarPermiso();
              ok();
            "
          >
            {{ modalMessage.text }}
          </b-button>          
        </template>
      </b-modal>
    </div>
    
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

    <div>
      <br />
      <br />

      <div class="">
        <b-form-input
          id="rcorners1"
          size="sm"
          v-model="filtroText"
          placeholder="Filtrar por Nombre"
        ></b-form-input>
      </div>
    </div>
    <br />
    <br />
    <!-- TABLE PERMISOS -->
    <div>
      <b-table
        hover
        :bordered="true"
        table-variant="Primary"
        responsive="sm"
        :items="permisos"
        :fields="permisosFields"
        :filter="filtroText"
        class="table"
      >
        <template #cell(actions)="bData">
          <b-button variant="outline-primary" @click="update(bData)">
            {{ bData.item.state }}
          </b-button>
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
</template>


<script>
import moment from "moment";
import store from "../../../../store";
import apiServices from "../../../../api-services";
import { mapActions } from "vuex";

export default {
  data() {
    return {
      filtroText: "",
      modalMessage: { text: " ", roleId: "" },
      permisosFields: [{ key: "descripcion" }, "estado", "actions"],
      errorGenerado: "",
      permisos: [],
      roles: [],
      selectedRole: null,
      selectedPermission: { permission: [] },
    };
  },
  methods: {
    filtroGrilla(data) {
      alert(data);
    },
    update(data) {
      this.selectedPermission = { permissions: [] };
      this.selectedPermission.permissions.push(data.item.id);
      this.modalMessage.text = data.item.state;
      this.$bvModal.show("modal-1");
    },
    onChangeRoles: function (event) {
      var _this = this;
      _this.selectedRole = event;
      this.getPermissions().then(function (response) {
        _this.permisos = response.data.sort((a, b) => a.nombre.localeCompare(b.nombre)); // #1
      });
    },
    getPermissions: function () {
      return apiServices.get(
        "permisos/roles/" + this.selectedRole + "/permissions"
      );
    },
    showError(error) {
      this.errorGenerado = error;
      this.$bvModal.show("modal-error");
    },
    getRoles: function () {
      return apiServices.get("permisos/roles");
    },
    habilitarPermiso: function () {
      var _this = this;

      this.habilitarPermisoApi().then(function (response) {
        _this.$data.permisos = response.data; // #1
      });
    },
    habilitarPermisoApi: function () {
      if (this.modalMessage.text == "Habilitar") {
        return apiServices.create(
          "permisos/roles/" + this.selectedRole + "/permissions",
          this.selectedPermission
        );
      } else {
        return apiServices.update(
          "permisos/roles/" + this.selectedRole + "/permissions",
          this.selectedPermission
        );
      }
    },
  },

  mounted: function () {
    var _this = this;

    this.getRoles()
      .then(function (response) {
        _this.$data.roles = response.data; // #1
      })
      .catch(function (error) {
        _this.showError(error);
      });
  },
};
</script>












<style >
</style>
