<template>
    <div v-if="canSeePage()">
        <list-view ref="listView" resource="liquidaciones" :customValidations="customValidations" :modalSize="modalSize" :showFooterModal="showFooterModal"   
                :searchBy="sada" :showCheck="true" :checkFunction="checkAllFunction"
            :showActions="true" :showEdit="showEdit" :showDelete="false" :onBeforeEdit="onBeforeEdit"  :filter=filtroGrillaOptions :onAfterLoad="onAfterLoad" :onBeforeSave="onBeforeSave" :disableSave="disableSave">
            <template slot="title"> Liquidaciones </template>
            <template slot="action-btn">
                <b-button variant="dark" size="sm"  @click="resetData"><img src="/assets/img/borrador.png" height ="20" width="20" /></b-button>
                <b-button class="mb-1 color-white" size="lg" variant="warning" :disabled="(this.liquidacionesAAutorizar.length<=0 && !
                this.checkAllChecked) || (!this.disableAuthorize && this.checkAllChecked)" v-if="canAuthorize()"
                    @click="autorizarLiquidaciones()">Autorizar</b-button>
                             <b-button class="mb-1" size="lg" variant="danger" :disabled="(this.liquidacionesAAutorizar.length<=0 && !this.checkAllChecked) || (!this.disableCancel && this.checkAllChecked)" v-if="canCancel()"
                    @click="cancelarLiquidaciones()">Cancelar</b-button>
                <b-button class="mb-1" size="lg" variant="primary" :disabled="(this.liquidacionespendientedefacturacion.length<=0 && !this.checkAllChecked) || (!this.disableSendErp && this.checkAllChecked)" @click="enviarAErp()">Envia a ERP
                </b-button>
                <b-button class="mb-1" size="lg" variant="info" :disabled="(this.allLiquidaciones.length<=0 && !this.checkAllChecked) || (!this.disableExportExcel && this.checkAllChecked)"
                    @click="descargarLiquidaciones()">Exportar a Excel
                </b-button>
            </template>
            <template slot="filters">
                <b-colxx :xxs="3">
                    <div class="filter float-md-left mr-6 align-top"></div>
                    <div class="filter-sm">
                        <select-deluxe resource="clientes" :selectItemLabel="({ razonSocialNombre }) => `${razonSocialNombre}`"
                            method="getAll" placeholder="Seleccionar cliente" valueField="id" v-model="filtroGrillaOptions.clienteId" class="list-filter"></select-deluxe>
                    </div>
                </b-colxx>
                <b-colxx :xxs="3">
                    <div class="filter float-md-left mr-6 align-top"></div>
                    <div class="filter-sm">
                        <b-form-datepicker class="filter-select" v-model="filtroGrillaOptions.fechaDesde" style="border-radius: 25px;"
                            placeholder="Fecha Desde">
                        </b-form-datepicker>
                    </div>
                </b-colxx>
                <b-colxx :xxs="3">
                    <div class="filter float-md-left mr-6 align-top"></div>
                    <div class="filter-sm">
                        <b-form-datepicker class="filter-select" v-model="filtroGrillaOptions.fechaHasta"  style="border-radius: 25px;"
                            placeholder="Fecha Hasta">
                        </b-form-datepicker>
                    </div>
                </b-colxx>
                <b-colxx :xxs="3">
                    <div class="filter float-md-left mr-12 align-top"></div>
                    <div class="filter-sm">
                        <b-form-select variant="outline-info" class="filter-select"  style="border-radius: 25px;"
                            v-model="filtroGrillaOptions.estado">
                            <option v-for="(selectOption, indexOpt) in estadosOptions" :key="indexOpt"
                                :value="selectOption.value">
                                {{ selectOption.text }}
                            </option>
                        </b-form-select>
                    </div>
                </b-colxx>
            </template>
            <template slot="columns">
                <column field="id" title="Id" width="15" />
                <column :field="(entity) => moment(entity.createDate).format('DD/MM/YYYY')" title="Fecha" width="100" />
                <column :field="(entity) => entity.cliente.razonSocialNombre" title="Cliente" width="150" />
                <column field="descripcion" title="Descripción" width="150" />
                <column :field="(entity) => { return '$ ' + maskForCulNum(entity.saldo)}" title="Saldo" width="140" />
                <column field="numeroFactura" title="Número factura" width="100" />
                <column :field="(entity) => { return '$ ' + maskForCulNum(entity.montoTotalImpuestos)}" title="Monto impuestos"
                    width="100" />
                <column :field="(entity) => { return '$ ' + maskForCulNum(entity.montoFinalFactura)}" title="Monto factura"
                    width="100" />
                <column :field="(entity) => getEstado(entity.estado)" title="Estado" width="50" />
                        <column :field="(entity) => { return entity.updatedBy ? entity.updatedBy  : entity.createdBy }" title="Usuario Modificación"/>      
                        <column :field="(entity) => moment(entity.updatedBy ? entity.updateDate  : entity.createDate).format('DD/MM/YYYY')" title="Fecha Modificación" width="50"/>    
                <column :field="(entity) => customerIsValid(entity.cliente) ? 'Ok' : 'Revisar'" title="Cliente Datos ERP" width="40" />                             
            </template>
            <template slot='modal-form' slot-scope="props">
                <div v-if="view === 0">
                    <b-row>
                        <b-col>
                            <b-form-group label="Id Liquidación">
                                <b-form-input v-model="props.form.entity.id" placeholder="Id" :disabled="true" />
                            </b-form-group>
                        </b-col>
                        <b-col>
                            <b-form-group label="Fecha">
                                <b-form-input :value="moment(props.form.entity.createDate).format('DD/MM/YYYY')"
                                    placeholder="Fecha" :disabled="true" />
                            </b-form-group>
                        </b-col>
                        <b-col>
                            <b-form-group label="Descripción">
                                <b-form-input v-model="props.form.entity.descripcion" placeholder="Descripción"
                                    :disabled="true" />
                            </b-form-group>
                        </b-col>
                    </b-row>
                    <b-row>
                        <b-col>
                            <b-form-group label="Saldo">
                                <b-form-input v-model="props.form.entity.saldo" placeholder="Saldo" :disabled="true" />
                            </b-form-group>
                        </b-col>
                        <b-col>
                            <b-form-group label="Estado">
                                <b-form-input v-model="props.form.entity.estadoText" placeholder="Estado"
                                    :disabled="true" />
                            </b-form-group>
                        </b-col>
                        <b-col>
                            <b-form-group label="Factura">
                                <b-form-input v-model="props.form.entity.factura" placeholder="Factura"
                                    :disabled="true" />
                            </b-form-group>
                        </b-col>
                        <b-col>
                            <b-form-group label="Cliente">
                                <b-form-input v-model="props.form.entity.clienteName" placeholder="Cliente"
                                    :disabled="true" />
                            </b-form-group>
                        </b-col>
                        <b-col>
                            <b-form-group label="Documento Cliente">
                                <b-form-input v-model="props.form.entity.documento"
                                    :disabled="true" />
                            </b-form-group>
                        </b-col>
                    </b-row>
                    <b-form>
                        <b-row>
                            <b-col>
                                <h3>Detalle</h3>
                            </b-col>
                        </b-row>
                        <b-row>
                            <b-col>
                                <b-form-group label="Concepto">
                                    <select-deluxe resource="conceptos" selectItemLabel="nombre" method="getAll"
                                        placeholder="Seleccionar concepto" :ordered="true"
                                        v-model="props.form.entity.conceptos">
                                    </select-deluxe>
                                    <b-form-invalid-feedback>Ingrese el Concepto</b-form-invalid-feedback>
                                </b-form-group>
                            </b-col>
                            <b-col>
                                <b-form-group label="Descuento">
                                    <b-form-input :value="isDiscount(props.form.entity.conceptos)" :disabled="true"/>                            
                                </b-form-group>   
                            </b-col>
                            <b-col>
                                <b-form-group label="Monto">
                                    <b-form-input type="text" v-model="props.form.entity.monto" placeholder="Monto"
                                        v-mask="numberMask" />
                                    <b-form-invalid-feedback>Ingrese el monto</b-form-invalid-feedback>
                                </b-form-group>
                            </b-col>
                            <b-col>
                                <b-form-group label="Observación">
                                    <b-form-input v-model="props.form.entity.observacion" placeholder="Observación" />
                                    <b-form-invalid-feedback>Ingrese Observación</b-form-invalid-feedback>
                                </b-form-group>
                            </b-col>
                            <b-col>
                                <div class="button-container">
                                    <b-button @click="agregarItem(props.form.entity)" variant="outline-primary" v-if="canAddConcept()"
                                        size="lg" class="mb-1" :disabled="validateConcept(props.form.entity) || props.form.entity.estado >= 2">Agregar
                                    </b-button>
                                </div>
                            </b-col>
                        </b-row>
                    </b-form>
                    <b-row>
                        <b-col>
                            <table class="table table-striped">
                                <tbody>
                                    <tr class="header">
                                        <td>Código</td>
                                        <td>Nombre</td>
                                        <td>Fecha Creación</td>
                                        <td>Monto</td>
                                        <td>Descuento</td>
                                        <td>Observación</td>
                                        <td>Estado</td>
                                        <td class="text-right">
                                            Acciones
                                        </td>
                                    </tr>
                                    <tr v-for="(item, index) in conceptos.filter(x => !x.deleted)" :key="item.id">
                                        <td>{{ item.concepto.id }}</td>
                                        <td>{{ item.concepto.nombre }}</td>
                                        <td>{{ item.createDate ? moment(item.createDate).format('DD/MM/YYYY') : '' }}
                                        </td>
                                        <td>{{ maskForCulNum(item.monto) }}</td>
                                        <td>{{ isDiscount(item.concepto) }}</td>
                                        <td>{{ item.observacion }}</td>
                                        <td>{{ getEstadoConceptoNombre(item.estado) }}</td>
                                        <td class="text-right">
                                            <a href="#" v-if="!item.concepto.isGeneric"
                                                @click.prevent="deleteItem(item, props.form.entity, index, liquidacionEstado)"
                                                class="simple-icon-trash" :class="{disabled: liquidacionEstado >= 2}" ></a>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </b-col>
                    </b-row>
                    <b-row class="saldo-container">
                        <p><strong>Saldo: {{ props.form.entity.saldo }}</strong></p>
                    </b-row>
                    <b-col class="d-flex justify-content-center" v-if="!confirmErp">
                        <button type="button" class="btn btn-outline-primary mx-2" v-if="props.form.entity.otrosComprobantes !== null" @click="downloadBill(props.form.entity.otrosComprobantes)">
                        <span>Descargar Factura</span>
                        </button>
                        <button type="button" class="btn btn-outline-primary mx-2" :disabled="!empty" @click="openOrdenesEnviosModal(props.form.entity)">
                        <span>Órdenes/Envíos</span>
                        </button>
                        <button type="button" class="btn btn-outline-primary mx-2" v-if="canaAttachFiles()"
                            @click="changeView(2)">Comprobantes</button>
                        <button type="button" class="btn btn-outline-primary mx-2" @click="confirmarErpSimple"
                            v-if="props.form.entity.estado === 2">Enviar a ERP</button>
                        <button type="button" class="btn btn-outline-primary mx-2"
                            @click="descargarLiquidacion">Descargar Liquidación</button>
                    </b-col>
                    <b-row>
                        <b-col class="d-flex align-items-center flex-column" v-if="confirmErp">
                            <b-row>
                                <h3 class="mb-3">Enviar Liquidacion a ERP</h3>
                            </b-row>
                            <b-row>
                                <button type="button" class="btn btn-outline-primary mx-2"
                                    @click="enviarErpSimple(props.form.entity)">Confirmar</button>
                                <button type="button" class="btn btn-outline-primary mx-2"
                                    @click="confirmarErpSimple">Cancelar</button>
                            </b-row>
                        </b-col>
                    </b-row>
                </div>
               
                <!-- COMPROBANTES -->
                <div v-if="view === 2">
                    <b-row>
                        <b-col>
                            <h3>Comprobantes</h3>
                        </b-col>
                    </b-row>
                    <!-- POSICION 1 -->
                    <b-row class="my-2">
                        <b-row class="w-100 d-flex justify-content-between">
                            <b-col class="col-3 d-flex align-items-center justify-content-center">
                                <p class="mb-0">1-</p>
                            </b-col>
                            <b-col class="col-6">
                                <b-form-input v-model="uploaded1.nombre" :disabled="true" v-if="validateFile(1)" />
                                <b-form-file accept=".pdf" v-model="file1" v-if="!validateFile(1)"
                                    placeholder="selecione un archivo o arrastre aquí..."
                                    drop-placeholder="Arrastre aquí..." />
                            </b-col>
                            <b-col class="d-flex col-3">
                                <b-button variant="primary" @click="uploadFile(1)" class="mr-1 mx-2" :disabled="!file1"
                                    v-if="!validateFile(1)">Subir</b-button>
                                <b-button variant="primary" class="mx-2" @click="downloadFile(uploaded1)"
                                    v-if="validateFile(1)"> Descargar </b-button>
                                <b-button variant="secondary" class="mx-2" @click="deleteFile(uploaded1.id, 1)"
                                    v-if="validateFile(1)"> Eliminar </b-button>
                            </b-col>
                        </b-row>
                    </b-row>
                    <!-- POSICION 2 -->
                    <b-row class="my-2" v-if="validateFile(1) || uploaded2">
                        <b-row class="w-100 d-flex justify-content-between">
                            <b-col class="col-3 d-flex align-items-center justify-content-center">
                                <p class="mb-0">2-</p>
                            </b-col>
                            <b-col class="col-6">
                                <b-form-input v-model="uploaded2.nombre" :disabled="true" v-if="validateFile(2)" />
                                <b-form-file accept=".pdf" v-model="file2" v-if="!validateFile(2)"
                                    placeholder="selecione un archivo o arrastre aquí..."
                                    drop-placeholder="Arrastre aquí..." />
                            </b-col>
                            <b-col class="d-flex col-3">
                                <b-button variant="primary" @click="uploadFile(2)" class="mr-1 mx-2" :disabled="!file2"
                                    v-if="!validateFile(2)">Subir</b-button>
                                <b-button variant="primary" class="mx-2" @click="downloadFile(uploaded2)"
                                    v-if="validateFile(2)">
                                    Descargar
                                </b-button>
                                <b-button variant="secondary" class="mx-2" @click="deleteFile(uploaded2.id, 2)"
                                    v-if="validateFile(2)">
                                    Eliminar</b-button>
                            </b-col>
                        </b-row>
                    </b-row>
                    <!-- POSICION 3 -->
                    <b-row class="my-2" v-if="validateFile(2) || uploaded3">
                        <b-row class="w-100 d-flex justify-content-between">
                            <b-col class="col-3 d-flex align-items-center justify-content-center">
                                <p class="mb-0">3-</p>
                            </b-col>
                            <b-col class="col-6">
                                <b-form-input v-model="uploaded3.nombre" :disabled="true" v-if="validateFile(3)" />
                                <b-form-file accept=".pdf" v-model="file3" v-if="!validateFile(3)"
                                    placeholder="selecione un archivo o arrastre aquí..."
                                    drop-placeholder="Arrastre aquí..." />
                            </b-col>
                            <b-col class="d-flex col-3">
                                <b-button variant="primary" @click="uploadFile(3)" class="mr-1 mx-2" :disabled="!file3"
                                    v-if="!validateFile(3)">Subir</b-button>
                                <b-button variant="primary" class="mx-2" @click="downloadFile(uploaded3)"
                                    v-if="validateFile(3)">
                                    Descargar
                                </b-button>
                                <b-button variant="secondary" class="mx-2" @click="deleteFile(uploaded3.id, 3)"
                                    v-if="validateFile(3)">
                                    Eliminar</b-button>
                            </b-col>
                        </b-row>
                    </b-row>
                    <!-- POSICION 4 -->
                    <b-row class="my-2" v-if="validateFile(3) || uploaded4">
                        <b-row class="w-100 d-flex justify-content-between">
                            <b-col class="col-3 d-flex align-items-center justify-content-center">
                                <p class="mb-0">4-</p>
                            </b-col>
                            <b-col class="col-6">
                                <b-form-input v-model="uploaded4.nombre" :disabled="true" v-if="validateFile(4)" />
                                <b-form-file accept=".pdf" v-model="file4" v-if="!validateFile(4)"
                                    placeholder="selecione un archivo o arrastre aquí..."
                                    drop-placeholder="Arrastre aquí..." />
                            </b-col>
                            <b-col class="d-flex col-3">
                                <b-button variant="primary" @click="uploadFile(4)" class="mr-1 mx-2" :disabled="!file4"
                                    v-if="!validateFile(4)">Subir</b-button>
                                <b-button variant="primary" class="mx-2" @click="downloadFile(uploaded4)"
                                    v-if="validateFile(4)">
                                    Descargar
                                </b-button>
                                <b-button variant="secondary" class="mx-2" @click="deleteFile(uploaded4.id, 4)"
                                    v-if="validateFile(4)">
                                    Eliminar</b-button>
                            </b-col>
                        </b-row>
                    </b-row>
                    <!-- POSICION 5 -->
                    <b-row class="my-2" v-if="validateFile(4) || uploaded5">
                        <b-row class="w-100 d-flex justify-content-between">
                            <b-col class="col-3 d-flex align-items-center justify-content-center">
                                <p class="mb-0">5-</p>
                            </b-col>
                            <b-col class="col-6">
                                <b-form-input v-model="uploaded5.nombre" :disabled="true" v-if="validateFile(5)" />
                                <b-form-file accept=".pdf" v-model="file5" v-if="!validateFile(5)"
                                    placeholder="selecione un archivo o arrastre aquí..."
                                    drop-placeholder="Arrastre aquí..." />
                            </b-col>
                            <b-col class="d-flex col-3">
                                <b-button variant="primary" @click="uploadFile(5)" class="mr-1 mx-2" :disabled="!file5"
                                    v-if="!validateFile(5)">Subir</b-button>
                                <b-button variant="primary" class="mx-2" @click="downloadFile(uploaded5)"
                                    v-if="validateFile(5)">
                                    Descargar
                                </b-button>
                                <b-button variant="secondary" class="mx-2" @click="deleteFile(uploaded5.id, 5)"
                                    v-if="validateFile(5)">
                                    Eliminar</b-button>
                            </b-col>
                        </b-row>
                    </b-row>
                    <!-- POSICION 6 -->
                    <b-row class="my-2" v-if="validateFile(5) || uploaded6">
                        <b-row class="w-100 d-flex justify-content-between">
                            <b-col class="col-3 d-flex align-items-center justify-content-center">
                                <p class="mb-0">6-</p>
                            </b-col>
                            <b-col class="col-6">
                                <b-form-input v-model="uploaded6.nombre" :disabled="true" v-if="validateFile(6)" />
                                <b-form-file accept=".pdf" v-model="file6" v-if="!validateFile(6)"
                                    placeholder="selecione un archivo o arrastre aquí..."
                                    drop-placeholder="Arrastre aquí..." />
                            </b-col>
                            <b-col class="d-flex col-3">
                                <b-button variant="primary" @click="uploadFile(6)" class="mr-1 mx-2" :disabled="!file6"
                                    v-if="!validateFile(6)">Subir</b-button>
                                <b-button variant="primary" class="mx-2" @click="downloadFile(uploaded6)"
                                    v-if="validateFile(6)">
                                    Descargar
                                </b-button>
                                <b-button variant="secondary" class="mx-2" @click="deleteFile(uploaded6.id, 6)"
                                    v-if="validateFile(6)">
                                    Eliminar</b-button>
                            </b-col>
                        </b-row>
                    </b-row>
                    <!-- POSICION 7 -->
                    <b-row class="my-2" v-if="validateFile(6) || uploaded7">
                        <b-row class="w-100 d-flex justify-content-between">
                            <b-col class="col-3 d-flex align-items-center justify-content-center">
                                <p class="mb-0">7-</p>
                            </b-col>
                            <b-col class="col-6">
                                <b-form-input v-model="uploaded7.nombre" :disabled="true" v-if="validateFile(7)" />
                                <b-form-file accept=".pdf" v-model="file7" v-if="!validateFile(7)"
                                    placeholder="selecione un archivo o arrastre aquí..."
                                    drop-placeholder="Arrastre aquí..." />
                            </b-col>
                            <b-col class="d-flex col-3">
                                <b-button variant="primary" @click="uploadFile(7)" class="mr-1 mx-2" :disabled="!file7"
                                    v-if="!validateFile(7)">Subir</b-button>
                                <b-button variant="primary" class="mx-2" @click="downloadFile(uploaded7)"
                                    v-if="validateFile(7)">
                                    Descargar
                                </b-button>
                                <b-button variant="secondary" class="mx-2" @click="deleteFile(uploaded7.id, 7)"
                                    v-if="validateFile(7)">
                                    Eliminar</b-button>
                            </b-col>
                        </b-row>
                    </b-row>
                    <!-- POSICION 8 -->
                    <b-row class="my-2" v-if="validateFile(7) || uploaded8">
                        <b-row class="w-100 d-flex justify-content-between">
                            <b-col class="col-3 d-flex align-items-center justify-content-center">
                                <p class="mb-0">8-</p>
                            </b-col>
                            <b-col class="col-6">
                                <b-form-input v-model="uploaded8.nombre" :disabled="true" v-if="validateFile(8)" />
                                <b-form-file accept=".pdf" v-model="file8" v-if="!validateFile(8)"
                                    placeholder="selecione un archivo o arrastre aquí..."
                                    drop-placeholder="Arrastre aquí..." />
                            </b-col>
                            <b-col class="d-flex col-3">
                                <b-button variant="primary" @click="uploadFile(8)" class="mr-1 mx-2" :disabled="!file8"
                                    v-if="!validateFile(8)">Subir</b-button>
                                <b-button variant="primary" class="mx-2" @click="downloadFile(uploaded8)"
                                    v-if="validateFile(8)">
                                    Descargar
                                </b-button>
                                <b-button variant="secondary" class="mx-2" @click="deleteFile(uploaded8.id, 8)"
                                    v-if="validateFile(8)">
                                    Eliminar</b-button>
                            </b-col>
                        </b-row>
                    </b-row>
                    <!-- POSICION 9 -->
                    <b-row class="my-2" v-if="validateFile(8) || uploaded9">
                        <b-row class="w-100 d-flex justify-content-between">
                            <b-col class="col-3 d-flex align-items-center justify-content-center">
                                <p class="mb-0">9-</p>
                            </b-col>
                            <b-col class="col-6">
                                <b-form-input v-model="uploaded9.nombre" :disabled="true" v-if="validateFile(9)" />
                                <b-form-file accept=".pdf" v-model="file9" v-if="!validateFile(9)"
                                    placeholder="selecione un archivo o arrastre aquí..."
                                    drop-placeholder="Arrastre aquí..." />
                            </b-col>
                            <b-col class="d-flex col-3">
                                <b-button variant="primary" @click="uploadFile(9)" class="mr-1 mx-2" :disabled="!file9"
                                    v-if="!validateFile(9)">Subir</b-button>
                                <b-button variant="primary" class="mx-2" @click="downloadFile(uploaded9)"
                                    v-if="validateFile(9)">
                                    Descargar
                                </b-button>
                                <b-button variant="secondary" class="mx-2" @click="deleteFile(uploaded9.id, 9)"
                                    v-if="validateFile(9)">
                                    Eliminar</b-button>
                            </b-col>
                        </b-row>
                    </b-row>
                    <!-- POSICION 10 -->
                    <b-row class="my-2" v-if="validateFile(9) || uploaded10">
                        <b-row class="w-100 d-flex justify-content-between">
                            <b-col class="col-3 d-flex align-items-center justify-content-center">
                                <p class="mb-0">10-</p>
                            </b-col>
                            <b-col class="col-6">
                                <b-form-input v-model="uploaded10.nombre" :disabled="true" v-if="validateFile(10)" />
                                <b-form-file accept=".pdf" v-model="file10" v-if="!validateFile(10)"
                                    placeholder="selecione un archivo o arrastre aquí..."
                                    drop-placeholder="Arrastre aquí..." />
                            </b-col>
                            <b-col class="d-flex col-3">
                                <b-button variant="primary" @click="uploadFile(10)" class="mr-1 mx-2"
                                    :disabled="!file10" v-if="!validateFile(10)">Subir</b-button>
                                <b-button variant="primary" class="mx-2" @click="downloadFile(uploaded10)"
                                    v-if="validateFile(10)">
                                    Descargar
                                </b-button>
                                <b-button variant="secondary" class="mx-2" @click="deleteFile(uploaded10.id, 10)"
                                    v-if="validateFile(10)">
                                    Eliminar</b-button>
                            </b-col>
                        </b-row>
                    </b-row>
                    <!-- CAMBIAR VIEW -->
                    <b-row class="mt-5">
                        <b-col class="d-flex justify-content-center">
                            <button type="button" class="btn btn-outline-primary" @click="changeView(0)">Volver a
                                Detalles</button>
                        </b-col>
                    </b-row>
                </div>
            </template>
            <!-- CHECKBOX -->
            <template slot="action-column" slot-scope="props">
                <b-checkbox ref="checkLiquidar" class="mb-1" size="m" variant="outline-info"  @change="seleccionarLiquidacion(props.entity)" v-model="props.entity.check" :disabled="disableCheck(props.entity)"></b-checkbox>

                <!-- :disabled="(!customerIsValid(props.entity.cliente) && props.entity.estado == 2) || (props.entity.estado == 4 || props.entity.estado == 5 || props.entity.estado == 3 || (props.entity.estado == 1 && props.entity.saldo <= 0))" -->
            </template>
        </list-view>
        <!-- CONFIRM MODAL -->
        <b-modal ref="confirmModal" :title="titleChangeStatus">
            {{bodyChangeStatus}}
            <template slot="modal-footer">
                <b-button variant="primary" v-if="toStatus === 2" @click="autorizar()" class="mr-1">Autorizar
                    Liquidaciones
                </b-button>
                <!-- <b-button variant="primary" v-if="toStatus === 4" @click="facturar()" class="mr-1">Facturar
                    Liquidaciones
                </b-button> -->
                <b-button variant="primary" v-if="toStatus === 4" @click="enviarErp()" class="mr-1">Enviar a ERP
                </b-button>
                <b-button variant="primary" v-if="toStatus === 3" @click="cancelar()" class="mr-1">Cancelar
                    Liquidaciones
                </b-button>
                <b-button variant="secondary" @click="$refs.confirmModal.hide()">Cancelar</b-button>
            </template>
        </b-modal> 
        <b-modal ref="editConceptModal" :size="modalSize"  title="Editar Concepto" class="modal-right">
            <b-form>
                <b-col>
                    <b-form-group label="Monto">
                        <b-form-input type="text" placeholder="monto" v-model="modalEditConcept.monto"
                            v-mask="numberMask" />
                        <b-form-invalid-feedback>Ingrese el monto</b-form-invalid-feedback>
                    </b-form-group>
                </b-col>
                <b-col>
                    <b-form-group label="Observación">
                        <b-form-input placeholder="Observación" v-model="modalEditConcept.observacion" />
                        <b-form-invalid-feedback>Ingrese Observación</b-form-invalid-feedback>
                    </b-form-group>
                </b-col>
            </b-form>
            <template slot="modal-footer">
                <b-button variant="primary" @click="editConcept()" class="mr-1">Aceptar</b-button>
                <b-button variant="secondary" @click="$refs.editConceptModal.hide()">Cancelar</b-button>
            </template>
        </b-modal>
        <b-modal ref="invalidErpRequests" title="Liquidación" size="xl">
            <b-form>
                <b-col>
                    <table class="table table-striped">
                        <tbody>
                            <tr class="header">
                                <td>Liquidación</td>
                                <td>Error</td>
                            </tr>
                            <tr v-for="item in invalidRequests" :key="item.liquidacionId">
                                <td>{{ item.liquidacionId }}</td>
                                <td>{{ item.message }}</td>                             
                            </tr>
                        </tbody>
                    </table>
                </b-col>
            </b-form>
            <template slot="modal-footer">
                <b-button variant="secondary" @click="closeRequestMessage()">Cerrar</b-button>
            </template>
        </b-modal>
        <b-modal ref="ordenesEnviosModal" title="Liquidación" size="xl" :hide-footer="true" no-close-on-backdrop @ok="handleOk">
             <!-- Oredenes/Envios -->
             <div v-if="arrOrdenes.length > 0">
                        <b-row>
                            <b-col>
                                <h3>Órdenes de Pago</h3>
                            </b-col>
                        </b-row>
                        <b-row>
                            <b-col>
                                <table class="table table-striped">
                                    <tbody>
                                        <tr class="header">
                                            <td>Id</td>
                                            <td>Cliente</td>
                                            <td>Código OP</td>
                                            <td>URL Pago</td>
                                            <td>Órdenes incluidas</td>
                                            <td>Preferencia MP</td>
                                            <td>Monto</td>
                                            <td>Estado</td>
                                            <td>Acciones</td>
                                        </tr>
                                        <tr v-for="item in arrOrdenes" :key="item.id">
                                            <td>{{ item.id }}</td>
                                            <td>{{ item.cliente.razonSocial}}</td>
                                            <td>{{ item.idMercadoPago}}</td>
                                            <td>{{ item.urlpago}}</td>
                                            <td>{{ getOrdenesIncluidas(item.codigoOrdenPago) }}</td>
                                            <td>{{ item.idPreferenciaMP}}</td>
                                            <td>{{item.valorSinImpuesto}}</td>
                                            <td>{{ordenEstado[item.estado].text}}</td>
                                            <td class="text-right">
                                                <a href="#" @click.prevent="cancelarOrdenEnvio('detalleliquidacionpre', item.id, item.valoritems)" :disabled="cancelDisabled ||  liquidacionEstado >= 2" class="simple-icon-trash"></a>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </b-col>
                        </b-row>
             </div>
             <div  v-if="arrEnvios.length > 0">
                        <b-row>
                            <b-col>
                                <h3>Envíos</h3>
                            </b-col>
                        </b-row>
                        <b-row>
                            <b-col>
                                <table class="table table-striped">
                                    <tbody>
                                        <tr class="header">
                                            <td>Id</td>
                                            <td>Cliente</td>
                                            <td>Etiqueta</td>
                                            <td>Cantidad</td>
                                            <td>Valor ítems</td>
                                            <td>Importe sin impuestos</td>

                                            <td>Estado</td>
                                            <td>Acciones</td>
                                        </tr>
                                        <tr  v-for="item in arrEnvios" :key="item.id">
                                            <td>{{ item.id }}</td>
                                            <td>{{ item.cliente.razonSocial}}</td>
                                            <td>{{ item.etiqueta}}</td>
                                            <td>{{ item.cantidad}}</td>
                                            <td>{{ item.valoritems }}</td>
                                            <td>{{ item.valorSinImpuesto}}</td>
                                            <td>{{ordenEstado[item.estado].text}}</td>
                                            <td class="text-right">
                                                <a href="#" @click.prevent="cancelarOrdenEnvio('detalleliquidacionpos',item.id, item.valorSinImpuesto)"  :class="{disabled: cancelDisabled  ||  liquidacionEstado >= 2}" class="simple-icon-trash"></a>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </b-col>
                        </b-row>
                    </div>
                    
                    <b-row class="d-flex justify-content-center">
                            <button type="button" class="btn btn-primary mx-2" @click="closeDetailModal()"> Volver a Detalle </button>
                        </b-row>
        </b-modal>
        <b-modal ref="errorModal" title="Error">
            <b-form>
                <b-col>
                    <p>{{errorMessage}}</p>
                </b-col>
            </b-form>
            <template slot="modal-footer">
                <b-button variant="secondary" @click="closeErrorModal()">Cerrar</b-button>
            </template>
        </b-modal>
        <loading ref="loader" />
    </div>
    <div v-else>
        <div class="welcome">
            <h2>No tiene permisos para ver esta pantalla</h2>
            <span class="home-logo"></span>
        </div>
    </div>
</template>

<script>
import moment from "moment";
import { validationMixin } from "vuelidate";
import apiServices from "../../../api-services";
import store from "../../../store";
import createNumberMask from "text-mask-addons/dist/createNumberMask";
const currencyMask = createNumberMask({
    prefix: "",
    allowDecimal: true,
    thousandsSeparatorSymbol: ".",
    decimalSymbol: ",",
    allowNegative: false,
});

export default {
    mixins: [validationMixin],
    data() {
        return {
            empty: false,
            confirmErp: false,
            clienteId: null,
            file1: null,
            file2: null,
            file3: null,
            file4: null,
            file5: null,
            file6: null,
            file7: null,
            file8: null,
            file9: null,
            file10: null,
            uploaded1: null,
            uploaded2: null,
            uploaded3: null,
            uploaded4: null,
            uploaded5: null,
            uploaded6: null,
            uploaded7: null,
            uploaded8: null,
            uploaded9: null,
            uploaded10: null,
            view: 0,
            numberMask: currencyMask,
            invalidRequests: [],
            customValidations: {
                id: {},
                createDate: {},
                descripcion: {},
                saldo: {},
                estado: {},
                factura: {},
                cliente: {},
                concepto: {}
            },
            searchSize: "3",
            modalSize: 'xl',
            showFooterModal: true,
            estadosOptions : [
                { value: null, text: "Estados Liquidación (Todos)"},
                { value: 1, text: "Pendiente Autorizacion" },
                { value: 2, text: "Autorizada" },
                { value: 3, text: "Cancelada" },
                { value: 4, text: "Pendiente Facturacion" },
                { value: 5, text: "Facturada" },
                { value: 6, text: "Pago" },
            ],
            filtroGrillaOptions: {
                clienteId: null,
                fechaDesde: null,
                fechaHasta: null,
                estado: null,
            },
            errorMessage: "Ha ocurrido un error, contacte a su adminsitrador",
            liquidacionId: 0,
            users: [],
            moment: moment,
            modalSize: "xl",
            customerFilter: { id: 0 },
            filterGasto: { id: 0, estadoId: 1, monedaId: 2 },
            ordenPagoHito: [],
            cannotSetBillData: true,
            token: store.state.auth.token,
            conceptos: [],
            selectedConcept: null,
            checkAllChecked: false,
            estados: {
                selected: 1,
                opciones: [
                    { value: 1, text: "Pendiente Autorización" },
                    { value: 2, text: "Autorizada" },
                    { value: 3, text: "Cancelada" },
                    { value: 4, text: "Pendiente Facturación" },
                    { value: 5, text: "Facturada" },
                    { value: 6, text: "Pago" },
                ],
            },
            tipoComprobantes: [
                { value: 1, text: "Factura" },
                { value: 2, text: "Caja" },
                { value: 3, text: "Nota de Crédito" },
                { value: 4, text: "Nota de Débito" },
            ],
            estadosConceptos: [
                { value: 1, text: 'Pendiente de Autorización' },
                { value: 2, text: 'Aprobado' },
            ],
            modalEditConcept: {
                index: -1,
                monto: 0,
                observacion: ''
            },
            titleChangeStatus: "",
            bodyChangeStatus: "",
            toStatus: 0,
            liquidacionesAAutorizar: [],
            liquidacionespendientedefacturacion: [],
            updateStatusLiquidacion: {
                ids: [],
                estadoId: 0
            },
            api: this.$api["liquidaciones"],
            allLiquidaciones: [],
            arrOrdenes: [],
            arrEnvios: [],
            ordenEstado: {
                1: { value: 1, text: 'Liquidada' },
                2: { value: 2, text: 'Pendiente' },
                3: { value: 3, text: 'Cancelada' }
            },
            cancelDisabled: false,
            disableSave: true,
            liquidacionEstado: 1,
            detailEntity: {},
            deletedBalance: 0,
                sada: 'Buscar por Descripción',
            uncheckedIds: [],
            disableAuthorize: false,
            disableSendErp: false,
            disableCancel: false,
            disableExportExcel: false,
            filteredId: null
        };
    },
    watch: {
        selectedConcept(newValue) {
            if (!newValue) {
                this.repeatedConcept = false
                return
            }
            const concept = this.conceptos.find(c => c.conceptoId === newValue.id)
            this.repeatedConcept = concept ? true : false
        }
    },
    validations: {
        form: {
            entity: {
                //proveedor: { required },
                //estadoId: {},
                //valor:{ required },
                //descripcion:{required},
                //proyecto : {},
                //hitos: {},
                //origen: { required },
                //tipoComprobanteId: {}
            },
        },
    },
    methods: {
        activateButtons() {
            if (this.checkAllChecked) {
                switch (this.filteredId) {
                    case 1:
                        this.disableCancel = true;
                        this.disableSendErp = false;
                        this.disableExportExcel = true;
                        this.disableAuthorize = true;
                        break;
                    case 2:
                        this.disableCancel = false;
                        this.disableSendErp = true;
                        this.disableExportExcel = true;
                        this.disableAuthorize = false;
                        break;
                    case 3:
                        this.disableCancel = false;
                        this.disableSendErp = false;
                        this.disableExportExcel = true;
                        this.disableAuthorize = false;
                        break;
                    case 4:
                        this.disableCancel = false;
                        this.disableSendErp = false;
                        this.disableExportExcel = true;
                        this.disableAuthorize = false;
                        break;
                    case 5:
                        this.disableCancel = false;
                        this.disableSendErp = false;
                        this.disableExportExcel = true;
                        this.disableAuthorize = false;
                        break;
                    case 6:
                        this.disableCancel = false;
                        this.disableSendErp = false;
                        this.disableExportExcel = true;
                        this.disableAuthorize = false;
                        break;
                    default:
                        this.disableCancel = true;
                        this.disableSendErp = true;
                        this.disableExportExcel = true;
                        this.disableAuthorize = true;
                        break;
                }
            }
            // { value: null, text: "Estados Liquidación (Todos)"},
            //     { value: 1, text: "Pendiente Autorizacion" },
            //     { value: 2, text: "Autorizada" },
            //     { value: 3, text: "Cancelada" },
            //     { value: 4, text: "Pendiente Facturacion" },
            //     { value: 5, text: "Facturada" },
            //     { value: 5, text: "Pago" },
                },
        canSeePage(){                          
                if (this.token) {
                    var objx =  JSON.parse(atob(this.token.split('.')[1])) ;
                    return objx.permissions.indexOf("write:liquidaciones") > -1 || objx.permissions.indexOf("read:liquidaciones") > -1 ;
                }        
            },
        canAuthorize() {            
            if (this.token) {
                var objx =  JSON.parse(atob(this.token.split('.')[1])) ;
            return objx.permissions.indexOf("write:autorizaLiquidacion") > -1;
            }
            
        },
        canAddConcept() {           
            if (this.token) {
                var objx =  JSON.parse(atob(this.token.split('.')[1])) ;
            return objx.permissions.indexOf("write:agregaConceptoLiquidacion") > -1;
            }            
        },
        canCancel() {            
            if (this.token) {
                var objx =  JSON.parse(atob(this.token.split('.')[1])) ;
            return objx.permissions.indexOf("write:cancelaliquidaciones") > -1;
            }
            
        },
        canaAttachFiles() {            
            if (this.token) {
                var objx =  JSON.parse(atob(this.token.split('.')[1])) ;
                return objx.permissions.indexOf("write:adjuntacomprobantes") > -1;
            }            
        },
        handleOk(bvModalEvent) {
        // Prevent modal from closing
        bvModalEvent.preventDefault()
        // Trigger submit handler
        this.handleSubmit()
      },
      downloadBill(url){
        window.open(url, '_blank');
      },
        closeRequestMessage() { 
            this.invalidRequests = [];
            this.$refs.confirmModal.hide();
            this.$refs.invalidErpRequests.hide();
        },
        customerIsValid(entity) {
            var datos = (entity.tipoImpuesto && entity.tipoDocumento && entity.localidad && entity.condicionPago) ? true : false;
            return datos;
        },
        openOrdenesEnviosModal(entity) {
            this.detailEntity = entity;
            this.deletedBalance = 0;
            this.$refs.ordenesEnviosModal.show();
        },
        changeView(viewNumber){
            this.showFooterModal = viewNumber === 0;
            this.view = viewNumber
        },
        closeDetailModal() {
            this.$refs.ordenesEnviosModal.hide()
        },
        getOrdenesIncluidas(codigoOrdenPago) {
            if (codigoOrdenPago)
            {
                return codigoOrdenPago.replaceAll(',','\n')
            }
            else {
                return '';
            }
        },
        cancelarOrdenEnvio(endPoint, ordenId, saldo) {
            if (this.liquidacionEstado < 2) {
                this.cancelDisabled = true
                this.$refs.loader.show()
                this.$http.put(`api/${endPoint}/${ordenId}/cancel`)
                .then(res => {
                    try {
                        if (res.ok) {
                            const index = this.detailEntity.conceptos.findIndex(x => x.concepto.isGeneric);  
                            let conceptoGenerico = this.conceptos.find(x => x.concepto.isGeneric);
                            conceptoGenerico.monto = conceptoGenerico.monto - saldo;
                            this.detailEntity.saldo = (this.detailEntity.saldo - saldo).toFixed(2);
                            if (index > -1 && this.detailEntity.saldo === 0) {
                                this.detailEntity.conceptos.splice(index, 1);
                            }
                            this.$refs.loader.hide()
                            this.getOrdenesEnvios()
                        } else {
                            this.errorMessage = "Ha ocurrido un error al eliminar el registro.";
                            this.$refs.errorModal.show();
                        }
                    }
                    catch (err) {
                        this.$refs.loader.hide()
                        this.cancelDisabled = false
                    }
                })
            }
        },
        showEdit(entity) {
            return entity.estado !== 3; 
        },
        disableCheck(entity) {
            return entity.estado === 3; 
        },
        async getOrdenesEnvios() {
            let ordenes = await this.$http.get('api/detalleliquidacionpre/liquidacion?id=' + this.liquidacionId)
            let envios = await this.$http.get('api/detalleliquidacionpos/liquidacion?id=' + this.liquidacionId)
            if (ordenes.ok || envios.ok) {
                this.arrOrdenes = ordenes.data
                this.arrEnvios = envios.data
                this.cancelDisabled = false
            }
            if(this.arrOrdenes.length){
                this.empty = true
            }
            if (this.arrEnvios.length) {
                this.empty = true
            }
        },
        descargarLiquidaciones() {
            if (this.checkAllChecked) {
                this.$refs.loader.show()      

                this.$http.post('api/liquidaciones/exportalltoexcel',{
                    uncheckedIds: this.uncheckedIds,
                    fechaDesde: this.filtroGrillaOptions.fechaDesde,
                    fechaHasta: this.filtroGrillaOptions.fechaHasta ,
                    clienteId: this.filtroGrillaOptions.clienteId,
                    estadoFilter: this.filtroGrillaOptions.estado,
                    search: this.$refs.listView.multiColumnSearchText,
                    estado: 2}, {
                    responseType: 'blob',
                })
                .then((response) => {
                    try {
                        const url = window.URL.createObjectURL(new Blob([response.body]));
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', `Liquidaciones.xlsx`);
                        document.body.appendChild(link);
                        link.click();
                        this.$refs.loader.hide();
                    }
                    catch (err) {
                        this.$refs.loader.hide();
                    }
                })
           
            } else {
            this.$refs.loader.show();
                this.$http.post('api/liquidaciones/excel', this.allLiquidaciones, {
                    responseType: 'blob',
                }).then((response) => {
                    try {
                        const url = window.URL.createObjectURL(new Blob([response.body]));
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', `Liquidaciones.xlsx`);
                        document.body.appendChild(link);
                        link.click();
                        this.$refs.loader.hide();
                    }
                    catch (err) {
                        this.$refs.loader.hide();
                    }
                })
            }
        },
        descargarLiquidacion() {
            this.$refs.loader.show();
            let liquidacionToDownload = [this.clienteId ];
            this.$http.post('api/liquidaciones/excel', liquidacionToDownload, {
                responseType: 'blob',
            }).then((response) => {
                try {
                    const url = window.URL.createObjectURL(new Blob([response.body]));
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', `Liquidaciones.xlsx`);
                    document.body.appendChild(link);
                    link.click();
                    this.$refs.loader.hide();
                }
                catch (err) {
                    this.$refs.loader.hide();
                }
            })
        },
        confirmarErpSimple() {
            this.confirmErp = !this.confirmErp
        },
        async enviarErpSimple(entity) {
            this.$refs.loader.show()            
            await this.api.sendErp({ids: [entity.id]})
                .then(res => {
                    this.$refs.loader.hide();
                     this.$refs.confirmModal.hide();

                    if (res.data.code == 400) {
                        this.invalidRequests = [ ...res.data.invalidRequests ];
                        this.$refs.invalidErpRequests.show();
                    } else if (res.data.code == 500) {
                        this.$refs.errorModal.show();
                    }

                    this.confirmErp = !this.confirmErp;
                })
        },
        async getFiles() {            
            let res = await this.$http.get('api/Liquidaciones/' + this.clienteId + '/Comprobante')
            if (res) {
                for (let i = 0; i < res.data.length; i++) {
                    switch (res.data[i].posicion) {
                        case 1:
                            this.uploaded1 = res.data[i]
                            break;
                        case 2:
                            this.uploaded2 = res.data[i]
                            break;
                        case 3:
                            this.uploaded3 = res.data[i]
                            break;
                        case 4:
                            this.uploaded4 = res.data[i]
                            break;
                        case 5:
                            this.uploaded5 = res.data[i]
                            break;
                        case 6:
                            this.uploaded6 = res.data[i]
                            break;
                        case 7:
                            this.uploaded7 = res.data[i]
                            break;
                        case 8:
                            this.uploaded8 = res.data[i]
                            break;
                        case 9:
                            this.uploaded9 = res.data[i]
                            break;
                        case 10:
                            this.uploaded10 = res.data[i]
                            break;
                    }
                }
                this.$refs.loader.hide()
            }
        },
        clearFiles() {
            this.uploaded1 = null
            this.uploaded2 = null
            this.uploaded3 = null
            this.uploaded4 = null
            this.uploaded5 = null
            this.uploaded6 = null
            this.uploaded7 = null
            this.uploaded8 = null
            this.uploaded9 = null
            this.uploaded10 = null
            this.file1 = null
            this.file2 = null
            this.file3 = null
            this.file4 = null
            this.file5 = null
            this.file6 = null
            this.file7 = null
            this.file8 = null
            this.file9 = null
            this.file10 = null
        },
        validateHasFile(position) {
            switch (position) {
                case 1:
                    return this.file1 !== null
                case 2:
                    return this.file2 !== null
                case 3:
                    return this.file3 !== null
                case 4:
                    return this.file4 !== null
                case 5:
                    return this.file5 !== null
                case 6:
                    return this.file6 !== null
                case 7:
                    return this.file7 !== null
                case 8:
                    return this.file8 !== null
                case 9:
                    return this.file9 !== null
                case 10:
                    return this.file10 !== null
            }
        },
        validateFile(position) {
            switch (position) {
                case 1:
                    return this.uploaded1 && this.uploaded1.id ? true : false
                case 2:
                    return this.uploaded2 && this.uploaded2.id ? true : false
                case 3:
                    return this.uploaded3 && this.uploaded3.id ? true : false
                case 4:
                    return this.uploaded4 && this.uploaded4.id ? true : false
                case 5:
                    return this.uploaded5 && this.uploaded5.id ? true : false
                case 6:
                    return this.uploaded6 && this.uploaded6.id ? true : false
                case 7:
                    return this.uploaded7 && this.uploaded7.id ? true : false
                case 8:
                    return this.uploaded8 && this.uploaded8.id ? true : false
                case 9:
                    return this.uploaded9 && this.uploaded9.id ? true : false
                case 10:
                    return this.uploaded10 && this.uploaded10.id ? true : false
            }
        },
        uploadFile(position) {
            this.$refs.loader.show();
            var formData = new FormData();
            switch (position) {
                case 1:
                    formData.append('archivo', this.file1);
                    formData.append('posicion', 1);
                    break;
                case 2:
                    formData.append('archivo', this.file2);
                    formData.append('posicion', 2);
                    break;
                case 3:
                    formData.append('archivo', this.file3);
                    formData.append('posicion', 3);
                    break;
                case 4:
                    formData.append('archivo', this.file4);
                    formData.append('posicion', 4);
                    break;
                case 5:
                    formData.append('archivo', this.file5);
                    formData.append('posicion', 5);
                    break;
                case 6:
                    formData.append('archivo', this.file6);
                    formData.append('posicion', 6);
                    break;
                case 7:
                    formData.append('archivo', this.file7);
                    formData.append('posicion', 7);
                    break;
                case 8:
                    formData.append('archivo', this.file8);
                    formData.append('posicion', 8);
                    break;
                case 9:
                    formData.append('archivo', this.file9);
                    formData.append('posicion', 9);
                    break;
                case 10:
                    formData.append('archivo', this.file10);
                    formData.append('posicion', 10);
                    break;
            }
            this.$http.post('api/Liquidaciones/' + this.clienteId + '/Comprobante', formData, {
                headers: { 'Content-Type': 'multipart/form-data', 'emulateJSON': 'true' }
            }).then((res) => {
                try {
                    this.getFiles()
                }
                catch (err) {
                    this.$refs.loader.hide();
                }
            })
        },
        deleteFile(id, position) {
            this.$refs.loader.show();
            this.$http.delete('api/liquidaciones/' + this.clienteId + '/Comprobante/' + id).then((res) => {
                try {
                    switch (position) {
                        case 1:
                            this.uploaded1 = null;
                            this.file1 = null;
                            break;
                        case 2:
                            this.uploaded2 = null;
                            this.file2 = null;
                            break;
                        case 3:
                            this.uploaded3 = null;
                            this.file3 = null;
                            break;
                        case 4:
                            this.uploaded4 = null;
                            this.file4 = null;
                            break;
                        case 5:
                            this.uploaded5 = null;
                            this.file5 = null;
                            break;
                        case 6:
                            this.uploaded6 = null;
                            this.file6 = null;
                            break;
                        case 7:
                            this.uploaded7 = null;
                            this.file7 = null;
                            break;
                        case 8:
                            this.uploaded8 = null;
                            this.file8 = null;
                            break;
                        case 9:
                            this.uploaded9 = null;
                            this.file9 = null;
                            break;
                        case 10:
                            this.uploaded10 = null;
                            this.file10 = null;
                            break;
                    }
                }
                catch (err) {
                    this.$refs.loader.hide();
                }
                finally {
                    this.$refs.loader.hide();
                }
            })
        },
        downloadFile(archivo) {
            this.$refs.loader.show();
            this.$http.get('api/liquidaciones/' + this.clienteId + '/Comprobante/' + archivo.id, {
                responseType: 'blob',
            }).then((response) => {
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `comprobante-${this.clienteId}-${archivo.id}.pdf`);
                document.body.appendChild(link);
                link.click();
                this.$refs.loader.hide();
            })
        },
        closeErrorModal(){ 
            this.errorMessage = "Ha ocurrido un error, por favor contacte a su administrador."
            this.$refs.errorModal.hide()
        },
        isConceptInvalid(form) {
            if (this.selectedConcept && form.monto && form.observacion && !this.repeatedConcept) {
                return false
            }
            return true
        },
        isDiscount(concepto) {
            if (concepto && concepto.id > 0){
                return concepto.descuento ? 'Si' : 'No';
            } else {
                return '';
            }
        },
        validateConcept(form) {
            if (form.conceptos?.id > 0 && form.monto && form.observacion) {
                return false
            }
            return true
        },
        seleccionarLiquidacion(entity) {
            const position = this.getLiquidacionPosition(entity.id, entity.estado);
            switch (entity.estado) {
                case 1:
                    if (position > -1) {
                        this.liquidacionesAAutorizar.splice(position, 1);
                        entity.check = false;
                        if (this.checkAllChecked) {
                            this.addToUnchecked(entity.id)
                        }
                    }                        
                    else {
                        this.liquidacionesAAutorizar.push(entity.id);
                        entity.check = true;
                        if (this.checkAllChecked) {              
                            this.removeFromUnchecked(entity.id)
                        }
                    }                        
                    break;
                case 2:
                    if (position > -1) {
                        this.liquidacionespendientedefacturacion.splice(position, 1);
                        entity.check = false;
                        if (this.checkAllChecked) {              
                            this.addToUnchecked(entity.id)
                        }
                    }                        
                    else {
                        this.liquidacionespendientedefacturacion.push(entity.id);
                        entity.check = true;
                        if (this.checkAllChecked) {
                            this.removeFromUnchecked(entity.id)
                        }
                    }                        
                    break;
                default:
                    if (this.checkAllChecked) {
                        if (entity.check) {
                            this.removeFromUnchecked(entity.id)
                        } else {
                            this.addToUnchecked(entity.id)
                        }                            
                    }
                    break;
            }
            if (this.allLiquidaciones.includes(entity.id)) {
                this.allLiquidaciones.splice(this.allLiquidaciones.indexOf(entity.id), 1)
                        entity.check = false;
            }
            else {
                this.allLiquidaciones.push(entity.id)
                        entity.check = true;
            }
        },
        addToUnchecked(id) {
            this.uncheckedIds.push(id)
        },
        removeFromUnchecked(id) {
            var indexPos = this.uncheckedIds.indexOf(id)
            if (indexPos > -1) {
                this.uncheckedIds.splice(indexPos, 1)
            }    
        },
        getLiquidacionPosition(id, estado) {
            switch (estado) {
                case 1:
                    return this.liquidacionesAAutorizar.indexOf(id);
                case 2:
                    return this.liquidacionespendientedefacturacion.indexOf(id);
                case 3:

                    break;
                default:
                    break;
            }
        },
        beDisabled(estado) {
            return estado === 3;
        },
        getUser(id) {
            const user = this.users.find((x) => x.userId === id);
            if (user) {
                return user.nombre;
            } else {
                return "";
            }
        },
        getUsers: function () {
            return apiServices.get("asignacion/users");
        },
        maskForCulNum(value) {
            if (value) {
                value = value.toString();
                if (value.indexOf(".") <= -1) {
                    value = value + ".00";
                } else {
                    const regDecimal = /^\-?[0-9]+(?:\.[0-9]{2})?$/;
                    if (!regDecimal.test(value)) {
                        value = value + "0";
                    }
                }
            }
            const replnum = value.toString().replace(".", ",");
            const numbers = replnum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
            return numbers;
        },
        async enviarErp() {
            this.$refs.loader.show()            
            if (this.checkAllChecked) {
                await this.api.sendAllErp({
                    uncheckedIds: this.uncheckedIds,
                    fechaDesde: this.filtroGrillaOptions.fechaDesde,
                    fechaHasta: this.filtroGrillaOptions.fechaHasta ,
                    clienteId: this.filtroGrillaOptions.clienteId,
                    search: this.$refs.listView.multiColumnSearchText
                })
                .then(res => {
                    this.$refs.loader.hide();
                     this.$refs.confirmModal.hide();
                    if (res.data.code == 400) {
                        this.invalidRequests = [ ...res.data.invalidRequests ];
                        this.$refs.invalidErpRequests.show();
                    } else if (res.data.code == 500) {
                        this.$refs.errorModal.show();
                    }

                    for(var i = 0; i<this.liquidacionespendientedefacturacion; i++) {
                        this.allLiquidaciones.splice(this.allLiquidaciones.indexOf(this.liquidacionespendientedefacturacion[i]), 1);
                    }
                     this.liquidacionespendientedefacturacion = [];

                    this.confirmErp = false

                    this.$refs.listView.refreshCurrentPage();
                })
            } else {
                await this.api.sendErp({ids: this.liquidacionespendientedefacturacion})
                .then(res => {
                    this.$refs.loader.hide();
                     this.$refs.confirmModal.hide();

                    if (res.data.code == 400) {
                        this.invalidRequests = [ ...res.data.invalidRequests ];
                        this.$refs.invalidErpRequests.show();
                    } else if (res.data.code == 500) {
                        this.$refs.errorModal.show();
                    }

                    for(var i = 0; i<this.liquidacionespendientedefacturacion; i++) {
                        this.allLiquidaciones.splice(this.allLiquidaciones.indexOf(this.liquidacionespendientedefacturacion[i]), 1);
                    }
                     this.liquidacionespendientedefacturacion = [];

                    this.confirmErp = false

                    this.$refs.listView.refreshCurrentPage();
                })
            }
            
        },
        actualizarEstados(listaIds, estadoId) {
            this.updateStatusLiquidacion.ids = listaIds;
            this.updateStatusLiquidacion.estadoId = estadoId;
            return this.api.updateStatus(estadoId, this.updateStatusLiquidacion);
        },
        autorizarLiquidaciones() {
            this.titleChangeStatus = 'AUTORIZAR';
            let msg = 'Liquidación';
            if (this.liquidacionesAAutorizar.length > 1) {
                msg = 'las Liquidaciones'
            }
            this.toStatus = 2;
            this.bodyChangeStatus = `¿Confirma que desea AUTORIZAR ${msg}?`;
            this.$refs.confirmModal.show();
        },
        async autorizar() {            
            if (this.checkAllChecked) {
                this.$refs.loader.show()      
                await this.api.updateAllStatus({
                    uncheckedIds: this.uncheckedIds,
                    fechaDesde: this.filtroGrillaOptions.fechaDesde,
                    fechaHasta: this.filtroGrillaOptions.fechaHasta ,
                    clienteId: this.filtroGrillaOptions.clienteId,
                    search: this.$refs.listView.multiColumnSearchText,
                    estado: 2
                })
                .then((response) => {
                    this.$refs.loader.hide();
                     this.$refs.confirmModal.hide();
                if (response.ok) { 
                    this.deshabilitarLiqAAutorizar();     
                    this.liquidacionesAAutorizar = [];
                    this.$refs.listView.refreshCurrentPage();
                } else {
                    this.errorMessage = response.body.message;
                    this.$refs.errorModal.show();      
                }  
                })
           
            } else {
                this.$refs.loader.show()      

                let response = await this.actualizarEstados(this.liquidacionesAAutorizar, 2);

                this.$refs.confirmModal.hide();
                if (response.body.code == 200) {
                    this.$refs.loader.hide()                 
                    this.deshabilitarLiqAAutorizar();     
                    this.liquidacionesAAutorizar = [];
                    this.$refs.listView.refreshCurrentPage();
                } else {
                    this.errorMessage = response.body.message;
                    this.$refs.loader.hide()
                    this.$refs.errorModal.show();      
                }
            }
            
        },
        deshabilitarLiqAAutorizar() {
            for(var i = 0; i<this.liquidacionesAAutorizar; i++) {
                    this.allLiquidaciones.splice(this.allLiquidaciones.indexOf(this.liquidacionesAAutorizar[i]), 1);
                }
                this.liquidacionesAAutorizar = [];
        },
        enviarAErp() {
            this.titleChangeStatus = 'ENVIAR A ERP';
            let msg = 'la Liquidación';
            if (this.liquidacionespendientedefacturacion.length > 1) {
                msg = 'las Liquidaciones'
            }
            this.toStatus = 4;
            this.bodyChangeStatus = `¿Confirma que desea enviar a ERP ${msg}?`;
            this.$refs.confirmModal.show();
        },
        cancelarLiquidaciones() {
            this.titleChangeStatus = 'CANCELAR';
            let msg = 'Liquidación';
            if (this.liquidacionesAAutorizar.length > 1) {
                msg = 'las Liquidaciones'
            }
            this.toStatus = 3;
            this.bodyChangeStatus = `¿Confirma que desea CANCELAR ${msg}?`;
            this.$refs.confirmModal.show();
        },
        async cancelar() {
            if (this.checkAllChecked) {
                this.$refs.loader.show()      

                await this.api.updateAllStatus({
                    uncheckedIds: this.uncheckedIds,
                    fechaDesde: this.filtroGrillaOptions.fechaDesde,
                    fechaHasta: this.filtroGrillaOptions.fechaHasta ,
                    clienteId: this.filtroGrillaOptions.clienteId,
                    search: this.$refs.listView.multiColumnSearchText,
                    estado: 3
                })
                .then((response) => {
                    this.$refs.confirmModal.hide();
                if (response.ok) {
                    this.$refs.loader.hide()      
                    this.deshabilitarLiqAAutorizar();     
                    this.$refs.listView.refreshCurrentPage();
                } else {
                    this.$refs.loader.hide()      
                }
            
                })           
            } else {
                this.$refs.loader.show()      
                let response = await this.actualizarEstados(this.liquidacionesAAutorizar, 3);
                this.$refs.confirmModal.hide();
                if (response.ok) {
                    this.$refs.loader.hide()      
                    this.deshabilitarLiqAAutorizar();     
                    this.$refs.listView.refreshCurrentPage();
                } else {
                    this.$refs.loader.hide()      
                }
            }
            
        },
        checkFormPermissions() {
            var objx = JSON.parse(atob(this.token.split(".")[1]));
            this.cannotSetBillData = objx.permissions.indexOf("write:datosFacturaPago") > -1;
        },
        refreshGridItem() {
            this.$refs.listView.search();
        },
        onAfterLoad() {
            this.filteredId = this.filtroGrillaOptions.estado   
            if (this.checkAllChecked) {
                for (var i = 0; i < this.$refs.listView.$refs.dataGrid.rows.length; i++) {
                    var entity = this.$refs.listView.$refs.dataGrid.rows[i];             
                    switch (entity.estado) {
                        case 1:                     
                            if (!this.uncheckedIds.includes(entity.id))
                            {
                                this.liquidacionesAAutorizar.push(entity.id);
                                entity.check = true;
                            }
                            break;
                        case 2:           
                        if (!this.uncheckedIds.includes(entity.id))
                            {
                                this.liquidacionespendientedefacturacion.push(entity.id);
                                entity.check = true;
                            }   
                            break;
                        default:
                        if (!this.uncheckedIds.includes(entity.id))
                            {
                                entity.check = true;
                            }  
                            break;
                    }

                    if (!this.allLiquidaciones.includes(entity.id) && !this.uncheckedIds.includes(entity.id)) {
                        this.allLiquidaciones.push(entity.id)
                        entity.check = true;
                    }
               }

                 
                this.activateButtons()
                if (this.$refs.listView.$refs.dataGrid.rows.length === 0) {
                        this.disableCancel = false;
                        this.disableSendErp = false;
                        this.disableExportExcel = false;
                        this.disableAuthorize = false;
                }
            } else {
                for (var i = 0; i < this.allLiquidaciones.length; i++) {
                    var found = this.$refs.listView.$refs.dataGrid.rows.find(x => x.id === this.allLiquidaciones[i]);
                    if (found) {
                        found.check = true;
                    }
               }
            }
        },
        getEstado: function (id) {
            return this.estados.opciones[id - 1].text;
        },
        getEstadoConceptoNombre(estadoId) {
            return this.estadosConceptos.find(x => x.value === estadoId).text;
        },
        resetData() {
            this.resetFilters();
            this.$refs.listView.resetTextAndSearch();
        },
        resetFilters() {
            this.filtroGrillaOptions.clienteId = null;
            this.filtroGrillaOptions.fechaDesde = null;
            this.filtroGrillaOptions.fechaHasta = null;
            this.filtroGrillaOptions.estado = null;
        },
        checkAllFunction() {
            this.checkAllChecked = !this.checkAllChecked
            if (this.checkAllChecked) {
                for (var i = 0; i < this.$refs.listView.$refs.dataGrid.rows.length; i++) {
                    var entity = this.$refs.listView.$refs.dataGrid.rows[i];                    
          
                    switch (entity.estado) {
                        case 1:                     
                            this.liquidacionesAAutorizar.push(entity.id);
                            entity.check = true;
                            break;
                        case 2:                       
                            this.liquidacionespendientedefacturacion.push(entity.id);
                            entity.check = true;
                            break;
                        default:
                            break;
                    }

                    if (!this.allLiquidaciones.includes(entity.id)) {
                        this.allLiquidaciones.push(entity.id)
                        entity.check = true;
                    }
               }
               this.activateButtons();
            } else {
                this.$refs.listView.$refs.dataGrid.rows.map(x => {x.check = false})
                this.allLiquidaciones = [];
                this.liquidacionespendientedefacturacion = []
                this.liquidacionesAAutorizar = []
                this.uncheckedIds = [];
            }           
        },
        onBeforeEdit(form) {
            let result = { hasErrors: false, messages: [] };
            result.hasErrors = result.messages.length > 0;
            if (form.entity?.id) {
                this.conceptos = form.entity.conceptos ? form.entity.conceptos.sort((a, b) => a.conceptoId - b.conceptoId) : []
            } else {
                this.conceptos = [];
            }
            this.liquidacionEstado = form.entity.estado;
            this.disableSave = form.entity.estado >= 2;
            this.empty = false
            this.liquidacionId = form.entity.id;
            this.clienteId = form.entity.id;
            this.clearFiles()
            this.$refs.loader.show()
            this.getOrdenesEnvios()
            this.getFiles()
            this.confirmErp = false
            // form.entity.createDate = moment(form.entity.createDate).format('DD/MM/YYYY')
            form.entity.estadoText = this.estados.opciones.find(x => x.value === form.entity.estado).text;
            form.entity.clienteName = form.entity.cliente.razonSocial;
            form.entity.documento = form.entity.cliente.numeroDeDocumento;
            if (this.view) {
                this.view = 0
            }
            return Promise.resolve(result);
        },
        onBeforeSave (form) {
                let result = { hasErrors: false, messages: [] };
                form.entity.conceptos = this.conceptos;
                return Promise.resolve(result);
            },
        onBeforeClose(form) {
            this.clearFiles();
            this.resetData();
            this.$refs.listView.search();
            return Promise.resolve(true);
        },
        agregarItem(entity) {
            this.repeatedConcept = false
            const formattedConcept = {
                concepto: {
                    nombre: entity.conceptos.nombre,
                    codigo: entity.conceptos.codigo,
                    id: entity.conceptos.id,
                    isGeneric: entity.conceptos.isGeneric,
                    descuento: entity.conceptos.descuento
                },
                conceptoId: entity.conceptos.id,
                monto: entity.monto.toString().replaceAll('.', '').replace(',', '.'),
                createDate: new Date(),
                observacion: entity.observacion,
                estadoNombre: 'Aprobado',
                estado: 2,
                deleted: false
            }
            this.selectedConcept = formattedConcept;
            this.conceptos.push(formattedConcept)
            const monto =  !formattedConcept.concepto.descuento ? 
                + entity.monto.replaceAll('.', '').replace(',', '.') :
                - entity.monto.replaceAll('.', '').replace(',', '.');
            entity.saldo = (+entity.saldo + monto).toFixed(2);
            this.resetConceptForm(entity)
        },
        resetConceptForm(entity) {
            this.selectedConcept = null
            entity.observacion = null
            entity.monto = null
        },
        editItem(concepto) {
            var editIndex = this.conceptos.indexOf(concepto);
            this.modalEditConcept = { index: editIndex, monto: concepto.monto, observacion: concepto.observacion }
            this.$refs.editConceptModal.show();
        },
        deleteItem(concepto, entity, index, estado) {
            // const conceptoIndex = this.conceptos.findIndex(c => c.conceptoId === concepto.conceptoId)
            if (estado < 2) {
                this.conceptos.splice(index, 1)
                const monto = !concepto.concepto.descuento ? concepto.monto : - concepto.monto;
                entity.saldo =  (entity.saldo - monto).toFixed(2);
                const selected = this.selectedConcept
                this.selectedConcept = null
                this.selectedConcept = selected
            }            
        },
        editStatus() {
            this.conceptos[this.modalEditConcept.index].monto = this.modalEditConcept.monto;
            this.conceptos[this.modalEditConcept.index].observacion = this.modalEditConcept.observacion;
            this.$refs.editConceptModal.hide();
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


<style>

.disabled {
  cursor: not-allowed;
  color: gray
}

.btn-warning.disabled, .btn-warning:disabled {
    color: white;
}

.invalid-feedback.show {
    display: block;
}

.error-message {
    color: var(--danger)
}

.button-container {
    padding-top: 27px !important;
}

table tbody tr.header {
    background-color: white !important;
    font-weight: 700;
    font-size: 14px;
}

table tbody tr.header td {
    background-color: white;
}

.custom-select {
    font-size: 13px;
}

.saldo-container {
    display: flex;
    justify-content: flex-end;
    padding: 15px;
}
.modal-header .close {
  display:none;
}

.welcome {
   display: flex;
    flex-direction: column;
    justify-content: center;
    height: 80vh;
    width: 100%;
    text-align: center;
}

   .home-logo{
    height: 80%;
    background: url(/assets/img/logo-black.png) no-repeat;
    background-position: center center;
    background-size: 45%;
   }


</style>