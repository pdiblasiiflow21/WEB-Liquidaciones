<template>
    <div class="clientes-container"  v-if="canSeePage()">
        <div class="grid"> 
            <list-view
                ref="listView"
                resource="clientes"
                :onBeforeSave="onBeforeSave"
                :customValidations="customValidations"
                :showActions="true"
                :showEdit="true"
                :modalSize="modalSize"
                :showDelete="false"                
                :searchBy="sada"
                :onBeforeEdit="onBeforeEdit"
                :filter=filtroGrillaOptions
                :disableSave="false"
            >
                <template slot='title'>
                    Clientes 
                </template>

        <template slot="action-btn">             
            <b-button variant="dark" size="sm"  @click="resetData"><img src="/assets/img/borrador.png" height ="20" width="20" /></b-button>
        </template> 

                <template slot="filters"> 
                    <b-colxx :xxs="3">
                        <div class="filter float-md-left mr-12 align-top"></div>
                        <div class="filter-sm">
                            <b-form-select style="border-radius: 25px;" placeholder="Estados de Facturación"
                                v-model="filtroGrillaOptions.estadoFacturacion">
                                <option value="">Estados Facturación (Todos)</option>
                                <option v-for="(selectOption, indexOpt) in estadosFacturacion" :key="indexOpt"
                                    :value="selectOption.value">
                                    {{ selectOption.text }}
                                </option>
                            </b-form-select>
                        </div>
                    </b-colxx>
                </template> 

                <template slot='columns'>
                    <column field="omsId" title="OMS Id" width="80"/>   
                    <column :field="(entity) => entity.razonSocialNombre" title="Razón Social" width="100"/>                                      
                    <column :field="(entity) => { return entity.tipoDocumento != null ? entity.tipoDocumento.descripcion + ': ' + entity.numeroDeDocumento : entity.numeroDeDocumento }" title="Tipo y N° Documento" width="200"/> 
                    <column :field="(entity) => { return entity.tipoImpuesto != null ? entity.tipoImpuesto.descripcion  : '' }" title="Condición IVA" width="150" />
                                        <column :field="(entity) => entity.estadosFacturacion" title="Estados Facturación" width="150" />              
                    <column field="email" title="Email" width="100"/>       
                    <column :field="(entity) => { return !entity.tipoImpuesto || !entity.tipoDocumento || !entity.provincia || !entity.localidad || !entity.condicionPago ? 'Revisar' : 'Ok' }"  title="Datos ERP" width="80"/>  
                        <column :field="(entity) => { return entity.updatedBy ? entity.updatedBy  : entity.createdBy }" title="Usuario Modificación" width="100"/>      
                        <column :field="(entity) => moment(entity.updatedBy ? entity.updateDate  : entity.createDate).format('DD/MM/YYYY')" title="Fecha Modificación" width="100"/>                                 
                </template>
                <template slot='modal-form' slot-scope="props">         
                    <b-row>
                        <b-col>      
                            <b-form-group label="OMS Id">
                                <b-form-input  v-model="props.form.entity.omsId" :disabled="true" />
                            </b-form-group>   
                        </b-col>
                        <b-col>      
                            <b-form-group label="Razón Social">
                                <b-form-input  v-model="props.form.entity.razonSocial" :disabled="true"/>                            
                            </b-form-group>   
                        </b-col>
                        <b-col>      
                            <b-form-group label="Nombre y Apellido">
                                <b-form-input :value="getName(props.form.entity.nombre, props.form.entity.apellido)" :disabled="true"/>                            
                            </b-form-group>   
                        </b-col>
                        <b-col>
                            <b-form-group label="CUIT">
                                <b-form-input  v-model="props.form.entity.numeroDeDocumento" v-mask="intMask" :formatter="maxNumeroDeDocumento"/>                          
                            </b-form-group>
                        </b-col>
                    </b-row>
                     <b-row>                
                        <b-col>
                            <b-form-group label="Email">
                                <b-form-input  v-model="props.form.entity.email"  :disabled="true"/>
                            </b-form-group>
                        </b-col>
                           <b-col>
                            <b-form-group label="Teléfono">
                                <b-form-input  v-model="props.form.entity.telefono" :disabled="true"/>
                            </b-form-group>
                        </b-col>
                        <b-col>
                            <b-form-group label="Nombre Usuario">
                                <b-form-input  v-model="props.form.entity.nombreUsuario" :disabled="true"/>
                            </b-form-group>
                        </b-col>
                        <b-col align-self="center">
                            <b-form-checkbox switch v-model="props.form.entity.envioPorEmail">Envío por email</b-form-checkbox>
                        </b-col>
                    </b-row>
                    <b-row>
                        <b-col>      
                            <b-form-group label="Calle *">
                                <b-form-input  v-model="props.form.entity.calle" placeholder="Calle" :state="$isValid(props.form.$v.form.entity.calle)" />
                                <b-form-invalid-feedback>Ingresar Calle</b-form-invalid-feedback>                                
                            </b-form-group>
                        </b-col>
                        <b-col>
                            <b-form-group label="Número *">
                                <b-form-input v-mask="cpStreetMask" v-model="props.form.entity.altura" placeholder="Número" :state="$isValid(props.form.$v.form.entity.altura)" />
                                <b-form-invalid-feedback>Ingresar Número</b-form-invalid-feedback>                                
                            </b-form-group>
                        </b-col>
                        <b-col>
                          <b-form-group label="Provincia *"> 
                            <select-deluxe resource="provincia" method="getAll" selectItemLabel="nombre" placeholder="Seleccionar Provincia" v-model="props.form.entity.provincia"  @input="setProvinceFilter(props.form.entity)" :state="$isValid(props.form.$v.form.entity.provincia)"></select-deluxe>
                             <div class="invalid-feedback show" v-if="$isValid(props.form.$v.form.entity.provincia) === false">Seleccionar Provincia</div>      
                          </b-form-group>             
                        </b-col>       
                        <b-col>
                          <b-form-group label="Localidad *"> 
                            <select-deluxe resource="localidad" method="getAll" selectItemLabel="nombre" placeholder="Seleccionar Localidad" v-model="props.form.entity.localidad" :filter="provinceFilter" :state="$isValid(props.form.$v.form.entity.localidad)"></select-deluxe>
                             <div class="invalid-feedback show" v-if="$isValid(props.form.$v.form.entity.localidad) === false">Seleccionar Localidad</div>      
                          </b-form-group>             
                        </b-col>      
                        <b-col>
                            <b-form-group label="CP *">
                                <b-form-input v-mask="cpStreetMask" v-model="props.form.entity.codigoPostal" placeholder="Código Postal" :state="$isValid(props.form.$v.form.entity.codigoPostal)" />
                                <b-form-invalid-feedback>Ingresar Código Postal</b-form-invalid-feedback>                                
                            </b-form-group>
                        </b-col>
                    </b-row>
                    <b-row>
                        <b-col>
                          <b-form-group label="Tipo de Cliente">
                              <b-form-input  :value="getTipoCliente(props.form.entity.tipoCliente)" placeholder="Tipo de cliente" :disabled="true"/>
                          </b-form-group>            
                        </b-col> 
                        <b-col>
                          <b-form-group label="Condicion IVA *"> 
                            <select-deluxe resource="tipoimpuesto" method="getAll" selectItemLabel="descripcion" placeholder="Seleccionar Condición IVA" v-model="props.form.entity.tipoImpuesto"  @input="setProvinceFilter(props.form.entity)" :state="$isValid(props.form.$v.form.entity.tipoImpuesto)"></select-deluxe>
                             <div class="invalid-feedback show" v-if="$isValid(props.form.$v.form.entity.tipoImpuesto) === false">Seleccionar Condición IVA</div>      
                          </b-form-group>             
                        </b-col>       
                        <b-col>
                          <b-form-group label="Tipo Documento *"> 
                            <select-deluxe resource="tipodocumento" method="getAll" selectItemLabel="descripcion" placeholder="Seleccionar Tipo Documento" v-model="props.form.entity.tipoDocumento"  @input="setProvinceFilter(props.form.entity)" :state="$isValid(props.form.$v.form.entity.tipoDocumento)"></select-deluxe>
                             <div class="invalid-feedback show" v-if="$isValid(props.form.$v.form.entity.tipoDocumento) === false">Seleccionar Tipo Documento</div>      
                          </b-form-group>             
                        </b-col>       
                        <b-col>
                          <b-form-group label="Condición de Pago *"> 
                            <select-deluxe resource="condicionPago" method="getAll" selectItemLabel="nombre" placeholder="Seleccionar Condición de Pago" v-model="props.form.entity.condicionPago"  :state="$isValid(props.form.$v.form.entity.condicionPago)"></select-deluxe>
                             <div class="invalid-feedback show" v-if="$isValid(props.form.$v.form.entity.condicionPago) === false">Seleccionar Condición de Pago</div>      
                          </b-form-group>             
                        </b-col>                        
                    </b-row>
                    <b-row>
                        <b-col>
                          <b-form-group label="Número de IIBB"> 
                             <b-form-input v-mask="intMask" :formatter="maxIngresosBrutos"   v-model="props.form.entity.numeroIngresosBrutos" max="12" placeholder="Número de Ingresos Brutos"/>
                          </b-form-group>             
                        </b-col>              
                        <b-col>                              
                            <div class="button-container">
                                <b-button @click="abrirModalIIBB(props.form.entity)" variant="outline-primary" size="lg" class="mb-1" >Adjuntar Documento</b-button>        
                            </div>   
                        </b-col> 
                         <b-col>                              
                            <div class="button-container">
                                <b-button @click="abrirModalMetodoEnvio(props.form.entity)" v-if="(props.form.entity.tipoCliente == 2)" variant="outline-primary" size="lg" class="mb-1" >Métodos de Envío</b-button>        
                            </div>   
                        </b-col>             
                    </b-row>
                    <b-form>
                        <b-row>
                            <b-col>
                                <h3>Impuestos</h3>
                            </b-col>
                        </b-row>
                        <b-row>
                            <b-col>
                                <b-form-group label="Impuesto"> 
                                    <select-deluxe resource="impuesto" selectItemLabel="descripcion"  v-model="props.form.entity.impuestos" method="getAll"  @input="validateImpuesto(props.form.entity)"  placeholder="Seleccionar impuesto"></select-deluxe>
                                    <b-form-invalid-feedback>Ingrese el impuesto</b-form-invalid-feedback>
                                </b-form-group>
                            </b-col>
                            <b-col>
                                <b-form-group label="Porcentaje exención"> 
                                    <b-form-input type="text" v-model="props.form.entity.porcentajeExencion" placeholder="%"  @input="validateImpuesto(props.form.entity)" v-mask="numberMask"/>  
                                    <b-form-invalid-feedback>Ingrese el porcentaje de exención</b-form-invalid-feedback> 
                                </b-form-group>         
                            </b-col>
                            <b-col>
                                <b-form-group label="Fecha desde"> 
                                    <b-form-datepicker v-model="props.form.entity.exencionDesde" placeholder="Fecha desde" :disabled="hasExcencion(props.form.entity)" @input="validateImpuesto(props.form.entity)" :date-format-options="{ year: 'numeric', month: '2-digit', day: '2-digit'}"></b-form-datepicker>     
                                    <b-form-invalid-feedback>Ingrese fecha de exención desde</b-form-invalid-feedback>
                                </b-form-group>
                            </b-col>
                            <b-col>
                                <b-form-group label="Fecha hasta"> 
                                    <b-form-datepicker v-model="props.form.entity.exencionHasta" placeholder="Fecha hasta" :disabled="hasExcencion(props.form.entity)" @input="validateImpuesto(props.form.entity)" :date-format-options="{ year: 'numeric', month: '2-digit', day: '2-digit'}"></b-form-datepicker>     
                                    <b-form-invalid-feedback>Ingrese fecha de exención hasta</b-form-invalid-feedback>
                                </b-form-group>
                            </b-col>                           
                            <b-col>                              
                                <div class="button-container">
                                    <b-button @click="agregarItem(props.form.entity)" variant="outline-primary" size="lg" class="mb-1" :disabled="validateImpuestoProp">Agregar</b-button>        
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
                                        <td>Descripción</td>
                                        <td>Porcentaje exención</td>
                                        <td>Fecha desde</td>
                                        <td>Fecha hasta</td>
                                        <td class="text-right">
                                            Acciones
                                        </td>
                                    </tr>
                                    <tr v-for="item in impuestos" :key="item.id">
                                        <td>{{ item.impuesto.codigo }}</td>
                                        <td>{{ item.impuesto.descripcion }}</td>
                                        <td>{{ !item.porcentajeExencion ? '' : maskForCulNum(item.porcentajeExencion) }}</td>
                                        <td>{{ !item.exencionDesde ? '' : moment(item.exencionDesde).format('DD/MM/YYYY') }}</td>
                                        <td>{{ !item.exencionHasta ? '' : moment(item.exencionHasta).format('DD/MM/YYYY') }}</td>
                                        
                                        <td class="text-right">
                                            <a href="#" @click.prevent="editItem(item)" class="simple-icon-pencil"></a>
                                             <a href="#" @click.prevent="deleteItem(item)" class="simple-icon-trash"></a>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </b-col>
                    </b-row>
                </template>
            </list-view>
             <b-modal ref="editImpuestoModal" title="Editar impuesto">
                 <b-form>
                        <b-col>
                            <b-form-group label="Porcentaje exención"> 
                                <b-form-input type="text" placeholder="%" v-model="modalEditImpuesto.porcentajeExencion" v-mask="numberMask" />  
                                <b-form-invalid-feedback>Ingrese el porcentaje de exención</b-form-invalid-feedback> 
                            </b-form-group>         
                        </b-col>
                        <b-col>
                            <b-form-group label="Fecha desde"> 
                                <b-form-datepicker v-model="modalEditImpuesto.exencionDesde" :disabled="hasExcencion(modalEditImpuesto)" placeholder="Fecha desde" :date-format-options="{ year: 'numeric', month: '2-digit', day: '2-digit'}"></b-form-datepicker>     
                                <b-form-invalid-feedback>Ingrese fecha de exención desde</b-form-invalid-feedback>
                            </b-form-group>
                        </b-col>
                        <b-col>
                            <b-form-group label="Fecha hasta"> 
                                <b-form-datepicker v-model="modalEditImpuesto.exencionHasta" :disabled="hasExcencion(modalEditImpuesto)" placeholder="Fecha hasta" :date-format-options="{ year: 'numeric', month: '2-digit', day: '2-digit'}"></b-form-datepicker>     
                                <b-form-invalid-feedback>Ingrese fecha de exención hasta</b-form-invalid-feedback>
                            </b-form-group>
                        </b-col>  
                 </b-form>
                <template slot="modal-footer">
                    <b-button variant="primary" @click="editImpuesto()" :disabled="validateEditImpuesto(modalEditImpuesto)" class="mr-1">Aceptar</b-button>
                    <b-button variant="secondary" @click="$refs.editImpuestoModal.hide()">Cancelar</b-button>
                </template>
            </b-modal>
             <b-modal ref="ingresosbrutosModal"  :size="iibbSize"  title="Adjuntar Documentación">
                 <b-form>                   
                     <b-row class="my-2">
                        <b-col class="col-2">
                            1 -
                        </b-col>
                        <b-col class="col-6">
                            <b-form-input v-model="uploaded1.nombre" :disabled="true"  v-if="validateFile(1)"/> 
                            <b-form-file accept=".pdf" v-model="file1" v-if="!validateFile(1)"  placeholder="Selecione un archivo o arrastre aquí..." drop-placeholder="Arrastre aquí..."/>  
                        </b-col>
                        <b-col class="col-4">
                            <b-button variant="primary" @click="uploadFile(1)" class="mr-1" v-if="!validateFile(1)" :disabled="!file1">Subir</b-button>
                            <b-button variant="primary" @click="downloadFile(uploaded1)" v-if="validateFile(1)">Descargar</b-button>
                            <b-button variant="secondary" @click="deleteFile(uploaded1.id, 1)" v-if="validateFile(1)">Eliminar</b-button>
                        </b-col>                                            
                    </b-row>
                    <b-row v-if="validateFile(1) || uploaded2" class="my-2">
                        <b-col class="col-2">
                            2 -
                        </b-col>
                        <b-col class="col-6">
                            <b-form-input v-model="uploaded2.nombre" :disabled="true"  v-if="validateFile(2)"/> 
                            <b-form-file accept=".pdf" v-if="!validateFile(2)"  placeholder="Selecione un archivo o arrastre aquí..." drop-placeholder="Arrastre aquí..." v-model="file2"/>                              
                        </b-col>
                         <b-col class="col-4">
                            <b-button variant="primary" @click="uploadFile(2)" class="mr-1" v-if="!validateFile(2)" :disabled="!file2">Subir</b-button>
                            <b-button variant="primary" @click="downloadFile(uploaded2)" v-if="validateFile(2)">Descargar</b-button>
                            <b-button variant="secondary" @click="deleteFile(uploaded2.id, 2)" v-if="validateFile(2)">Eliminar</b-button>
                        </b-col>                                            
                    </b-row>
                    <b-row v-if="validateFile(2) || uploaded3" class="my-2">
                        <b-col class="col-2">
                             3 -
                         </b-col>
                        <b-col class="col-6">
                            <b-form-input v-model="uploaded3.nombre" :disabled="true"  v-if="validateFile(3)"/> 
                            <b-form-file accept=".pdf"  v-if="!validateFile(3)" placeholder="Selecione un archivo o arrastre aquí..." drop-placeholder="Arrastre aquí..." v-model="file3"/>                              
                        </b-col>
                        <b-col class="col-4">
                            <b-button variant="primary" @click="uploadFile(3)" class="mr-1" v-if="!validateFile(3)" :disabled="!file3">Subir</b-button>
                            <b-button variant="primary" @click="downloadFile(uploaded3)" v-if="validateFile(3)">Descargar</b-button>
                            <b-button variant="secondary" @click="deleteFile(uploaded3.id, 3)" v-if="validateFile(3)">Eliminar</b-button>
                        </b-col>                                            
                    </b-row>
                    <b-row v-if="validateFile(3) || uploaded4" class="my-2">
                       <b-col class="col-2">
                             4 -
                         </b-col>
                        <b-col class="col-6">
                             <b-form-input v-model="uploaded4.nombre" :disabled="true"  v-if="validateFile(4)"/> 
                            <b-form-file accept=".pdf" v-if="!validateFile(4)" placeholder="Selecione un archivo o arrastre aquí..." drop-placeholder="Arrastre aquí..." v-model="file4"/>                              
                        </b-col>
                        <b-col class="col-4">
                            <b-button variant="primary" @click="uploadFile(4)" class="mr-1" v-if="!validateFile(4)" :disabled="!file4">Subir</b-button>
                            <b-button variant="primary" @click="downloadFile(uploaded4)" v-if="validateFile(4)">Descargar</b-button>
                            <b-button variant="secondary" @click="deleteFile(uploaded4.id, 4)" v-if="validateFile(4)">Eliminar</b-button>
                        </b-col>                                            
                    </b-row>
                    <b-row v-if="validateFile(4) || uploaded5" class="my-2">
                        <b-col class="col-2">
                             5 -
                         </b-col>
                         <b-col class="col-6">
                             <b-form-input v-model="uploaded5.nombre" :disabled="true"  v-if="validateFile(5)"/> 
                            <b-form-file accept=".pdf" v-if="!validateFile(5)" placeholder="Selecione un archivo o arrastre aquí..." drop-placeholder="Arrastre aquí..." v-model="file5"/>                              
                        </b-col>
                        <b-col class="col-4">
                            <b-button variant="primary" @click="uploadFile(5)" class="mr-1" v-if="!validateFile(5)" :disabled="!file5">Subir</b-button>
                            <b-button variant="primary" @click="downloadFile(uploaded5)" v-if="validateFile(5)">Descargar</b-button>
                            <b-button variant="secondary" @click="deleteFile(uploaded5.id, 5)" v-if="validateFile(5)">Eliminar</b-button>
                        </b-col>                                            
                    </b-row>
                 </b-form>
                <template slot="modal-footer">                    
                    <b-button variant="secondary" @click="$refs.ingresosbrutosModal.hide()">Cancelar</b-button>
                </template>
            </b-modal>
            <b-modal ref="metodosEnvio" title="Métodos de envío" :size="sizeMetodosEnvio">
                 <b-form>
                        <b-row>
                            <b-col>
                                <b-form-group label="Seleccionar método de envío">
                                    <b-form-select v-model="modalMetodoEnvio.metodoEnvio" :options="metodosEnvio" placeholder="Método de envío">                      
                                    </b-form-select>
                                    <b-form-invalid-feedback>Seleccionar método de envío</b-form-invalid-feedback>
                                </b-form-group>    
                            </b-col>
                            <b-col>
                                <b-form-group label="Seleccionar estados para facturar">
                                        <b-form-checkbox-group
                                        v-model="modalMetodoEnvio.estadosFacturacion"
                                        :options="estadosFacturacion"
                                        class="mb-3"
                                        value-field="value"
                                        text-field="text"
                                        disabled-field="notEnabled"
                                        ></b-form-checkbox-group>
                                </b-form-group>
                            </b-col>
                            <b-col align-self="center">
                                <b-button variant="primary" @click="agregarMetodoDeEnvio(modalMetodoEnvio)" class="mr-1" :disabled="validateMetodoEnvio(modalMetodoEnvio)">Agregar</b-button>
                            </b-col>
                        </b-row>
                 </b-form>
                 <b-row>
                        <b-col>
                            <table class="table table-striped">
                                <tbody>
                                     <tr class="header">
                                        <td>Método de envío</td>
                                        <td>Estados para facturar</td>
                                        <td class="text-right">
                                            Acciones
                                        </td>
                                    </tr>
                                    <tr v-for="(item, index) in metodosDeEnvioAux"  :key="index">
                                        <td>{{ getMetodoEnvio(item.metodoEnvio) }}</td>
                                        <td>{{ getEstadosFacturacion(item.estadosFacturacion) }}</td>                                        
                                        <td class="text-right">
                                            <a href="#" @click.prevent="deleteMetodoDeEnvio(item)" class="simple-icon-trash"></a>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </b-col>
                    </b-row>
                <template slot="modal-footer">
                    <b-button variant="primary" @click="saveMetodosDeEnvio()" class="mr-1">Aceptar</b-button>
                    <b-button variant="secondary" @click="$refs.metodosEnvio.hide()">Cancelar</b-button>
                </template>
            </b-modal>
        </div>   
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
    const { required, minValue } = require('vuelidate/lib/validators')
    import createNumberMask from 'text-mask-addons/dist/createNumberMask';
    import moment from 'moment';
    import store from "../../../../store";

    const currencyMask = createNumberMask({
      prefix: '',
      integerLimit: 3,
      allowDecimal: true,
      thousandsSeparatorSymbol: '.',
      decimalSymbol: ',',
      allowNegative: false,
    });
    const integerMask = createNumberMask({
        prefix: '',
        allowDecimal: false,
        allowNegative: false,
        includeThousandsSeparator: false
    });
    const cpAndStreetMask = createNumberMask({
        prefix: '',
        integerLimit: 8,
        allowDecimal: false,
        allowNegative: false,
        includeThousandsSeparator: false
    });

    export default {
        data () {
            return {
                moment: moment,
                selectedMetodosEnvio: [],
                metodosDeEnvioAux: [],
                metodosDeEnvio: [],
                selectedEstadosFacturacion: [],
                numberMask: currencyMask,
                intMask: integerMask,
                cpStreetMask: cpAndStreetMask,
                customValidations: {     
                    omsId: {},
                    razonSocial: {},
                    nombre: {},
                    apellido: {},
                    calle:{ required },
                    altura:{ required },
                    codigoPostal:{ required },
                    email:{},
                    telefono:{},
                    numeroDeDocumento:{},
                    condicionPago: { required },
                    tipoImpuesto: { required },
                    tipoDocumento: { required },
                    provincia: { required },
                    localidad: { required },
                    tipoCliente: { required },
                    envioPorEmail: {},
                    numeroIngresosBrutos: {},
                    nombreUsuario: {},
                    estado: {},
                    ingresosBrutosArchivos: {}
                },
                sada: 'Buscar por Nombre / Usuario / Razón Social / Documento',
                api: this.$api["clientes"],
                impuestos: [],
                modalSize: 'xl',
                iibbSize: 'lg',
                sizeMetodosEnvio: 'xl',
                tipoClientes: [
                  { value: 1, text: 'Prepago'},
                  { value: 2, text: 'Pospago'}
                ], 
                estadosFacturacion: [
                  { value: 10, text: 'Descargado'},
                  { value: 48, text: 'No Colectado'},
                  { value: 25, text: 'Entregado'},
                  { value: 26, text: 'No Entregado'},
                  { value: 51, text: 'Proceso Devolución'},
                ], 
                metodosEnvio: [
                    { value: 4, text: 'Logística inversa' },
                    { value: 1, text: 'Puerta a puerta' }
                ],
                filtroGrillaOptions: {
                    estadoFacturacion: ''
                },
                provinceFilter: { provinciaId: 0 },
                tipoDocumentoFilter: { tipoDocumentoId: 0 },
                tipoImpuestoFilter: { tipoImpuestoId: 0 },
                validateImpuestoProp: true,
                modalEditImpuesto: {
                    index: -1,
                    porcentajeExencion: 0,
                    exencionDesde: '',
                    exencionHasta: ''
                },
                modalMetodoEnvio: {
                    metodoEnvio: null,
                    estadosFacturacion: []
                },
                ingresosbrutosModal: {
                    id: '',
                    name: '',
                },
                clienteId: null,
                ingresosBrutosArchivos: [],
                file1: null,
                file2: null,
                file3: null,
                file4: null,
                file5: null,
                uploaded1: null,
                uploaded2: null,
                uploaded3: null,
                uploaded4: null,
                uploaded5: null,
                token: store.state.auth.token,
            }
        },
        methods: {
            canSeePage(){                          
                if (this.token) {
                    var objx =  JSON.parse(atob(this.token.split('.')[1])) ;
                    return objx.permissions.indexOf("write:clientes") > -1 || objx.permissions.indexOf("read:clientes") > -1 ;
                }        
            },
            maxIngresosBrutos(e){
                return String(e).substring(0,12);
            },
            maxNumeroDeDocumento(e){
                return String(e).substring(0,11);
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
                        return this.file5  !== null
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
                }
            },
            validateImpuesto(form) {
                let porcentaje = 0
                if (form.porcentajeExencion) {
                    porcentaje = + form.porcentajeExencion.replace(',', '.')
                }

                if (form.impuestos && form.impuestos.id && ((form.porcentajeExencion && (+ porcentaje) > 0 &&
                    form.exencionDesde &&
                    form.exencionHasta &&
                    (form.exencionHasta >= form.exencionDesde)) || (!form.porcentajeExencion))  &&
                    !this.impuestos.some(x => x.impuestoId === form?.impuestos.id))
                {
                    this.validateImpuestoProp = false;
                    return false;
                }
                    this.validateImpuestoProp = true;
                return true;
            },
            validateEditImpuesto(form) {

                if ( ((form.porcentajeExencion &&
                    form.exencionDesde &&
                    form.exencionHasta && form.exencionHasta >= form.exencionDesde) || !form.porcentajeExencion) )
                {
                    return false;
                }
                return true;
            },
            hasExcencion(form) {
                
                let porcentaje = 0
                if (form.porcentajeExencion) {
                    porcentaje = + form.porcentajeExencion.replace(',', '.')
                }
                if ((form.porcentajeExencion && porcentaje <= 0) || !form.porcentajeExencion)
                {                     
                    form.exencionDesde = null;
                    form.exencionHasta = null;
                    return true
                }

                return false
                
            },
            clearDates(form) {
                if (!form.porcentajeExencion || (form.porcentajeExencion && form.porcentajeExencion <= 0))
                {
                    form.exencionDesde = null;
                    form.exencionHasta = null;
                }
            },
            maskForCulNum(value) {
              value = value.toString();
              if (value.indexOf('.') <= -1) {
                value = value + '.00';
              } else {
                const regDecimal = /^\-?[0-9]+(?:\.[0-9]{2})?$/;
                if (!regDecimal.test(value)){
                  value = value + '0';
                }
              }
              const replnum = value.replace('.', ',');
              const numbers = replnum.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
              return numbers;
            },
            getMetodoEnvio(metodoEnvio) {
                return this.metodosEnvio.find(x => x.value === metodoEnvio)?.text;
            },
            getEstadosFacturacion(estadosFacturacion) {
                let estadosDeFacturacion = [];
                estadosFacturacion.forEach(x => {
                    let estadoFacturacion = this.estadosFacturacion.find(y => y.value === x)?.text;
                    if (estadoFacturacion)
                        estadosDeFacturacion.push(estadoFacturacion);
                });
                return estadosDeFacturacion.join(', ');
            },
            getTipoCliente(tipoClienteValue) {
                return this.tipoClientes.find(x => x.value === tipoClienteValue)?.text;
            },
            getName(nombre, apellido) {
                return nombre && apellido ? nombre + ' ' + apellido : '';
            },
            getCondicionIva(condicionIva) {
                return this.condicionesIVA.find(x => x.value === condicionIva).text;
            },
            setProvinceFilter(entity) {
                this.provinceFilter = { provinciaId: entity.provincia ? entity.provincia.id  : 0 };
            },
            setTipoDocumentoFilter(entity) {
                this.tipoDocumentoFilter = { tipoDocumentoId: entity.tipoDocumento ? entity.tipoDocumento.id  : 0 };
            },
            setTipoImpuestoFilter(entity) {
                this.provinceFilter = { tipoImpuestoId: entity.tipoImpuesto ? entity.tipoImpuesto.id  : 0 };
            },
            resetData() {
                this.resetFilters();
            },
            resetFilters() {
                this.filtroGrillaOptions.estadoFacturacion = '';
                this.refreshGridItem();
            },
            refreshGridItem () {
                let cfiler = this.filtroGrillaOptions;
                this.$refs.listView.resetTextAndSearch();
            },
            onBeforeSave (form) {
                let result = { hasErrors: false, messages: [] };
                result.hasErrors = result.messages.length > 0;              
                let i = [...this.impuestos ];
                form.entity.impuestos = i;
                form.entity.metodosEnvio = [...this.metodosDeEnvio];
                return Promise.resolve(result);
            },
            onBeforeEdit (form) {
                let result = { hasErrors: false, messages: [] };
                result.hasErrors = result.messages.length > 0;
                if (form.entity && form.entity.id > 0) {
                    form.exencionDesde = null;
                    form.exencionHasta = null;
                    this.impuestos = form.entity.impuestos ? [...form.entity.impuestos ] : [];
                    this.metodosDeEnvio = form.entity.metodosEnvio ? [...form.entity.metodosEnvio] : [];
                } else {
                    this.metodosDeEnvio = [];
                    this.impuestos = [];
                }

                this.clienteId = form.entity.id;
                
                return Promise.resolve(result); 
            },
            agregarMetodoDeEnvio(item)
            {
                this.metodosDeEnvioAux.push({metodoEnvio: item.metodoEnvio, estadosFacturacion: item.estadosFacturacion});
                this.modalMetodoEnvio.metodoEnvio = null;
                this.modalMetodoEnvio.estadosFacturacion = [];
            },
            deleteMetodoDeEnvio(item) {
                var removeIndex = this.metodosDeEnvioAux.map(function (item) {
                    return item;
                }).indexOf(item);
                this.metodosDeEnvioAux.splice(removeIndex, 1); 
            },
            saveMetodosDeEnvio()
            {
                this.metodosDeEnvio = [... this.metodosDeEnvioAux ];
                this.$refs.metodosEnvio.hide();
            },
            validateMetodoEnvio(item)
            {
                if (item?.metodoEnvio && !this.metodosDeEnvioAux.some(x => x.metodoEnvio === item?.metodoEnvio) && item?.estadosFacturacion.length > 0)
                    return false;
                return true;
            },
            agregarItem(i) {
                this.impuestos.push({impuesto: {descripcion: i.impuestos.descripcion, id: i.impuestos.id, codigo: i.impuestos.codigo}, impuestoId: i.impuestos.id, porcentajeExencion: i.porcentajeExencion?.toString().replaceAll('.','').replace(',', '.'), exencionDesde: i.exencionDesde ?? '', exencionHasta: i.exencionHasta  ?? ''});
                i.impuestos = null;
                i.porcentajeExencion = null;
                i.exencionDesde = null;
                i.exencionHasta = null;
            },
            deleteItem(impuesto) {
                var removeIndex = this.impuestos.map(function (impuesto) {
                    return impuesto;
                }).indexOf(impuesto);
                this.impuestos.splice(removeIndex, 1); 
            },
            editItem(impuesto) {
                 var editIndex = this.impuestos.map(function (impuesto) {
                    return impuesto;
                }).indexOf(impuesto);
                this.modalEditImpuesto = { index: editIndex, porcentajeExencion: this.maskForCulNum(impuesto.porcentajeExencion), exencionDesde: impuesto.exencionDesde, exencionHasta: impuesto.exencionHasta}
                this.$refs.editImpuestoModal.show();
            },
            editImpuesto() {
                this.impuestos[this.modalEditImpuesto.index].porcentajeExencion = this.modalEditImpuesto.porcentajeExencion?.toString().replaceAll('.','').replace(',', '.');
                this.impuestos[this.modalEditImpuesto.index].exencionDesde = this.modalEditImpuesto.exencionDesde;
                this.impuestos[this.modalEditImpuesto.index].exencionHasta = this.modalEditImpuesto.exencionHasta;
                this.$refs.editImpuestoModal.hide();
            },
            abrirModalMetodoEnvio(entity) {
                this.metodosDeEnvioAux = [... this.metodosDeEnvio ];
                this.modalMetodoEnvio.metodoEnvio = null;
                this.modalMetodoEnvio.estadosFacturacion = [];
                this.$refs.metodosEnvio.show();
            },
            abrirModalIIBB(entity) {
                this.$refs.loader.show()
                this.$http.get('api/Cliente/' + this.clienteId + '/IngresosBrutos').then((res) => {
                    this.$refs.loader.hide()
                for(let i = 0; i < res.data.length; i++) {
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
                }
                }
                this.$refs.ingresosbrutosModal.show();
                 })
                 .catch((error) => {
                 }).finally(() => {
                 });                
            },
            uploadFile(position) {
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
                }

                this.$refs.loader.show();               
                this.$http.post('api/Cliente/' + this.clienteId + '/IngresosBrutos', formData, {
                    headers: { 'Content-Type': 'multipart/form-data', 'emulateJSON': 'true' }
                }).then((res) => {
                    this.$refs.loader.hide()
                    if (res) {
                        this.$http.get('api/Cliente/' + this.clienteId + '/IngresosBrutos').then((res) => {
                            for(let i = 0; i < res.data.length; i++) {
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
                                }
                            }
                        })      
                    }                   
                 })
            },
            deleteFile(id, position) {
                this.$refs.loader.show()
                this.$http.delete('api/Cliente/' + this.clienteId + '/IngresosBrutos/' + id).then((res) => {
                    this.$refs.loader.hide()
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
                        }
                 })  
            },
            downloadFile(archivo) {
                this.$refs.loader.show()
                this.$http.get('api/Cliente/' + this.clienteId + '/IngresosBrutos/' + archivo.id, {
                    responseType: 'blob',
                }).then((res) => {
                    this.$refs.loader.hide()
                   const file = new Blob(
                        [res.data], 
                        {type: 'application/pdf'});
                        const fileURL = URL.createObjectURL(file);
                        let link = document.createElement('a')
                        link.href = fileURL;
                        link.download =  archivo.nombre + '.pdf'
                        link.click()
                        // download(fileURL, file.nombre);  
                 })
                 .catch((error) => {
                 }).finally(() => {
                 });    
            }
        }
    };
</script>


<style>
    .invalid-feedback.show {
        display: block
    }

        
    .button-container{
        padding-top: 27px;
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
        font-size: 0.8rem;
    }

    .warning {
        color: red;
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