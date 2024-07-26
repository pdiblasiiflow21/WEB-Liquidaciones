<template>
  <div class="list-view">
    <b-row>
      <b-colxx xxs="12">
        <h1>
          <slot name="title">
            Title
          </slot>
        </h1>
        <div class="top-right-button-container">
          <slot name="actions">
            <slot name="action-btn">
            </slot>
            <b-button variant="primary" v-if="showNew" size="lg" class="top-right-button new-button" @click="setCreate">
              Nuevo</b-button>
          </slot>
        </div>
      </b-colxx>
    </b-row>
    <b-row align-h="end">
      <slot name="filters">
      </slot>
      <b-colxx :xxs="searchSize">
        <search v-model="multiColumnSearchText" @input="search" :searchBy="searchBy" :debounce="600" @refresh="search" ref="search"></search>
      </b-colxx>
      <slot name="new-buttons">
      </slot>
    </b-row>

    <div class="separator mb-5"></div>
    <b-row>
      <b-colxx xxs="12" class="rounded">
        <b-card class="mb-4">
          <data-grid ref="dataGrid" :resource="resource" :method="method" :showActions="showActions" :showNew="showNew" :showCheck="showCheck" :checkFunction="checkFunction"
            :filter="filter" :onAfterLoad="onAfterLoad" :onBeforeLoad="onBeforeLoad" :disableSave="disableSave">
            <slot name="columns"></slot>
            <template slot="action-column" slot-scope="props">
              <slot name="action-column" :entity="props.entity"></slot>
              <b-button class="mb-1" size="xs" variant="outline-info" @click="setEdit(props.entity)"
                v-if="showEdit !== null && (typeof showEdit == 'function' ? showEdit(props.entity) : showEdit)">
                Editar</b-button>
              <b-button class="mb-1" size="xs" variant="outline-primary" @click="confirmDelete(props.entity)"
                v-if="showDelete !== null && (typeof showDelete == 'function' ? showDelete(props.entity) : showDelete)">
                Eliminar</b-button>
            </template>
          </data-grid>
        </b-card>
      </b-colxx>
    </b-row>

    <b-modal id="modalright" :size="modalSize" ref="entityModal" :title="modalTitle" class="modal-right"
      @close="closeModal()" no-close-on-backdrop>
      <b-form>
        <slot name="modal-form" v-bind:form="form">Add for controls here</slot>
        <error-info :show="resultModal.hasErrors" :messages="resultModal.messages"></error-info>

        <!-- <div class="footer">
          <b-button variant="outline-secondary" @click="$refs.entityModal.hide()">Cerrar</b-button>
          <b-button type="submit" variant="primary" class="mr-1">Aceptar</b-button>
        </div> -->
      </b-form>
      <template slot="modal-footer">
        <b-button variant="outline-secondary"  @click="closeModal()">Cerrar</b-button>
        <b-button type="submit" variant="primary"   class="mr-1" @click="save()" :disabled="disableSave !== null ? disableSave : ($v.form ? $v.form.$invalid : false)">Aceptar</b-button>
      </template>
    </b-modal>

    <b-modal ref="confirmModal" :title="deleteTitle">
      ¿Desea continuar con la operación?
      <error-info :show="resultModal.hasErrors" :messages="resultModal.messages"></error-info>
      <template slot="modal-footer">
        <b-button variant="primary" @click="doDelete()" class="mr-1">Aceptar</b-button>
        <b-button variant="secondary" @click="$refs.confirmModal.hide()">Cancelar</b-button>
      </template>
    </b-modal>
    <b-modal ref="modalTrial" :title="`Indique la fecha a la que desea extender la licencia.`">
      <div class="form-group has-top-label">
        <v-date-picker mode="single" v-model="newExpirationDate" :input-props="{ placeholder: 'Hasta'}"
          :min-date="new Date()"></v-date-picker>
      </div>
      <template slot="modal-footer">
        <b-button variant="primary" @click="extendTrial(newExpirationDate)" class="mr-1">Aceptar</b-button>
        <b-button variant="secondary" @click="$refs.modalTrial.hide()">Cancelar</b-button>
      </template>
    </b-modal>
    <loading ref="loader" />
  </div>
</template>

<script>
import { validationMixin } from 'vuelidate'

export default {
  props: {
    resource: {
      type: String,
      required: true
    },
    method: {
      type: String,
      required: false,
      default: 'query'
    },
    onBeforeEdit: {
      type: Function,
      required: false
    },
    onBeforeSave: {
      type: Function,
      required: false
    },
    onBeforeClose: {
      type: Function,
      required: false
    },
    onAfterSave: {
      type: Function,
      required: false
    },
    onBeforeDelete: {
      type: Function,
      required: false
    },
    customValidations: {
      type: Object,
      required: false
    },
    showActions: {
      required: false
    },
    showNew: {
      required: false
    },
    showEdit: {
      required: false
    },
    disableSave: {
      required: false,
      default: null
    },
    showDelete: {
      required: false
    },
    searchBy: {
      required: false,
      default: 'Buscar'
    },  
    showCheck: { 
      required: false,
      default: false },
    checkFunction: {
      type: Function,
      required: false
    },
    filter: {
      type: Object,
      required: false,
      default: function () {
        return {};
      }
    },
    onAfterLoad: {
      type: Function,
      required: false
    },
    onBeforeLoad: {
      type: Function,
      required: false
    },
    modalSize: {
      type: String,
      default: 'md'
    },
    searchSize: {
      type: String,
      default: '12'
    },
    showFooterModal: {
      type: Boolean,
      required: false,
      default: true
    }
  },
  mixins: [validationMixin],
  data() {
    return {
      result: { hasErrors: false, messages: [] },
      resultModal: { hasErrors: false, messages: [] },
      form: {
        entity: {},
        data: {}
      },
      currentEntity: null,
      multiColumnSearchText: null,
      newExpirationDate: null
    }
  },
  watch: {},
  computed: {
    api() {
      return this.$api[this.resource]
    },
    modalTitle() {
      let op = this.form.entity.id ? 'Edición' : 'Alta';
      return `${this.$slots.title[0].text} - ${op}`;
    },
    deleteTitle() {
      return `${this.$slots.title[0].text} - Baja`;
    }
  },
  validations() {
    return this.customValidations ? { form: { entity: this.customValidations } } : {}
  },
  async created() {
    this.form.$v = this.$v;

    if (this.api.dataList) {
      let response = await this.api.dataList();
      this.form.data = response.body;
    }
  },
  methods: {
    refreshCurrentPage() {
      this.$refs.dataGrid.getPage();
    },
    search() {
      this.$refs.dataGrid.search(this.multiColumnSearchText);
    },
    searchExternal(filt) {
      this.filter = filt;
      this.$refs.dataGrid.search(this.multiColumnSearchText);
    },
    resetTextAndSearch(){
      this.multiColumnSearchText = null;
      this.$refs.search.resetInput();
      this.$refs.dataGrid.search(this.multiColumnSearchText);

    },
    async closeModal() {
      if (this.onBeforeClose) {
        await this.onBeforeClose(this.form);
      }
      this.$refs.entityModal.hide();
    },
    async setCreate() {
      this.$refs.loader.show();
      this.$v.form.entity.$reset();
      this.resultModal.hasErrors = false;
      this.form.entity = {};

      if (this.onBeforeEdit) {
        await this.onBeforeEdit(this.form);
      }

      this.$refs.entityModal.show();
      this.$refs.loader.hide(300);
    },
    async setEdit(entity) {
      this.$refs.loader.show();
      this.$v.form.entity.$reset();
      this.resultModal.hasErrors = false;
      this.form.entity = { ...entity };

      if (this.onBeforeEdit) {
        await this.onBeforeEdit(this.form);
      }

      this.$refs.entityModal.show();
      this.$refs.loader.hide(300);
    },
    async save() {
      this.$refs.loader.show();
      this.$v.form.entity.$touch();

      if (this.onBeforeSave) {
        this.resultModal = await this.onBeforeSave(this.form);
        if (this.resultModal && this.resultModal?.hasErrors) {
          this.$refs.loader.hide(300);
          return;
        }
      }

      if (this.$v.form.entity.$invalid) {
        this.$refs.loader.hide(300);
        return;
      }

      try {
        if (this.form.entity.id) {
          //await this.api.validations();
          await this.api.update({ id: this.form.entity.id }, this.form.entity);
        } else {
          await this.api.save(this.form.entity);
        }

        if (this.onAfterSave) {
          await this.onAfterSave(this.form.entity);
        }

        this.$refs.dataGrid.getPage();
        this.$refs.entityModal.hide();
        this.$refs.loader.hide(300);
      } catch (ex) {
        this.resultModal = ex.body.result;
        this.$refs.loader.hide(300);
      }
    },
    confirmDelete(entity) {
      this.form.entity = { ...entity };
      this.resultModal.hasErrors = false;
      this.currentEntity = entity;
      this.$refs.confirmModal.show();
    },
    async doDelete() {
      if (this.resultModal?.hasErrors)
      {
        this.$refs.confirmModal.hide();
        return;
      };

      this.$refs.loader.show();
      this.$v.form.entity.$touch();

      if (this.onBeforeDelete) {
        this.resultModal = await this.onBeforeDelete(this.form);
        if (this.resultModal && this.resultModal?.hasErrors) {
          this.$refs.loader.hide(300);
          return;
        }
      }

      try {
        await this.api.delete({ id: this.currentEntity.id });
        this.currentEntity.deleted = true;

        if (this.onAfterSave) {
          await this.onAfterSave(this.currentEntity);
        }

        this.$refs.dataGrid.getFirstPage();
        this.$refs.confirmModal.hide();
        this.$refs.loader.hide(300);
        this.currentEntity = null
      } catch (ex) {
        this.resultModal = ex.body.result;
        this.$refs.errorM.showError(ex);
        this.$refs.loader.hide(300);
      }
    },
    openTrialModal(entity) {
      this.form.entity = { ...entity };
      this.$refs.modalTrial.show();
    },

    async extendTrial(newExpirationDate) {
      this.$refs.loader.show();
      try {
        if (this.form.entity.id) {
          await this.$api.licencias.expirationDate({ id: this.form.entity.id, date: newExpirationDate.toISOString() }, {})
        }
        if (this.onAfterSave) {
          await this.onAfterSave(this.form.entity);
        }
        this.$refs.dataGrid.getPage();
        this.$refs.modalTrial.hide();
        this.$refs.loader.hide(300);
      } catch (ex) {
        this.resultModal = ex.body.result;
        this.$refs.loader.hide(300);
        this.$refs.errorM.showError(ex);
      }
    },
  }
}
</script>

<style>
.footer {
  text-align: right;
  position: relative;
  top: 10px;
}

.list-view .search {
  margin: 10px 0;
}

.button-trial {
  width: 105px;
}
</style>
