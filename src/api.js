﻿import settings from './settings';

export default Vue => ({
    usuarios: Vue.resource('api/usuario/{id}', {}, {
        basicQuery: { method: 'GET', url: 'api/usuario/query/basic' },
        changeStatus: { method: 'PUT', url: 'api/usuario/status/{id}/{status}' },
        getDetail: { method: 'GET', url: 'api/usuario/{id}/detail' },
        getResumenGeneral: { method: 'GET', url: 'api/usuario/reports/resumenGeneral' },
        getTareasPorEstados: { method: 'GET', url: 'api/usuario/{id}/reports/tareasPorEstados' },
        getAltertas: { method: 'GET', url: 'api/usuario/{id}/reports/alertas' },
        byCompany: { method: 'GET', url: 'api/usuario/compania/{id}' },
        getAll: { method: 'GET', url: 'api/usuario' },
    }),
    auth: Vue.resource('api/auth/getUsers', {}, {
        //getAllUsers: { method: 'GET', url: 'api/auth/getAllUsers' },
        getUsers: { method: 'GET', url: 'api/auth/getUsers' },
        save: { method: 'POST', url: 'api/auth/createUser' },
        update: { method: 'PUT', url: 'api/updateUser/{id}' },
        delete: { method: 'DELETE', url: 'api/deleteUser/{id}' },
        blockUser: { method: 'PATCH', url: 'api/auth/blockUser' }
    }),

    conceptos: Vue.resource('api/concepto', {}, {
        basicQuery: { method: 'GET', url: 'api/concepto/query/basic' },
        getAll: { method: 'GET', url: 'api/concepto' },
        update: { method: 'PUT', url: 'api/concepto/{id}' },
        delete: { method: 'DELETE', url: 'api/concepto/{id}' },
        validatedelete: { method: 'POST', url: 'api/concepto/validatedelete' },
        validateupdate: { method: 'POST', url: 'api/concepto/validateupdate' },
        validatecreate: { method: 'POST', url: 'api/concepto/validatecreate' },
        expirationDate: { method: 'PUT', url: 'api/concepto/expirationDate/{id}/{date}' },
    }),

    clientes: Vue.resource('api/cliente', {}, {
        basicQuery: { method: 'GET', url: 'api/cliente/query/basic' },
        getAll: { method: 'GET', url: 'api/cliente' },
        update: { method: 'PUT', url: 'api/cliente/{id}' },
        delete: { method: 'DELETE', url: 'api/cliente/{id}' },
        expirationDate: { method: 'PUT', url: 'api/cliente/expirationDate/{id}/{date}' },
    }),
    role: Vue.resource('api/role', {}, {
        basicQuery: { method: 'GET', url: 'api/moneda/query/basic' },
        delete: { method: 'DELETE', url: 'api/role/{id}' },
    }),
    asignacion: Vue.resource('api/asignacion/usuarios/roles', {}, {
        basicQuery: { method: 'GET', url: 'api/asignacion/query/basic' },
        update: { method: 'PUT', url: 'api/asignacion/update' },
        assignRole: { method: 'POST', url: 'api/asignacion/assign' },
        unassignRole: { method: 'POST', url: 'api/asignacion/unassign' }
    }),
    estados: Vue.resource('api/estado', {}, {
        basicQuery: { method: 'GET', url: 'api/estado/query/basic' },
        getAll: { method: 'GET', url: 'api/estado' },
        update: { method: 'PUT', url: 'api/estado/{id}' },
        delete: { method: 'DELETE', url: 'api/estado/{id}' },
        expirationDate: { method: 'PUT', url: 'api/estado/expirationDate/{id}/{date}' },
    }),
    ordenpago: Vue.resource('api/ordenpago', {}, {
        basicQuery: { method: 'GET', url: 'api/ordenpago/query/basic' },
        getAll: { method: 'GET', url: 'api/ordenpago' },
        update: { method: 'PUT', url: 'api/ordenpago/{id}' },
        delete: { method: 'DELETE', url: 'api/ordenpago/{id}' },
        expirationDate: { method: 'PUT', url: 'api/ordenpago/expirationDate/{id}/{date}' },
    }),
    provincia: Vue.resource('api/provincia', {}, {
        getAll: { method: 'GET', url: 'api/provincia' },
    }),
    localidad: Vue.resource('api/localidad', {}, {
        getAll: { method: 'GET', url: 'api/localidad' },
    }),
    detalleliquidacionpre: Vue.resource('api/detalleliquidacionpre', {}, {
        getAll: { method: 'GET', url: 'api/detalleliquidacionpre' },
        generaliquidacion: { method: 'POST', url: 'api/detalleliquidacionpre/generaliquidacion' },
        generaallliquidaciones: { method: 'POST', url: 'api/detalleliquidacionpre/generaallliquidaciones' },
        getByLiquidacion: { method: 'POST', url: 'api/detalleliquidacionpre/liquidacion' },
        generaExcel: {method: 'POST', url: 'api/detalleliquidacionpre/excel', responseType: 'blob'},
        exportAllToExcel: {method: 'POST', url: 'api/detalleliquidacionpre/exportAllToExcel', responseType: 'blob'}
    }),
    detalleliquidacionpos: Vue.resource('api/detalleliquidacionpos', {}, {
        getAll: { method: 'GET', url: 'api/detalleliquidacionpos' },
        generaliquidacion: { method: 'POST', url: 'api/detalleliquidacionpos/generaliquidacion' },        
        generaallliquidaciones: { method: 'POST', url: 'api/detalleliquidacionpos/generaallliquidaciones' },
        generaExcel: {method: 'POST', url: 'api/detalleliquidacionpos/excel', responseType: 'blob'},
        exportAllToExcel: {method: 'POST', url: 'api/detalleliquidacionpos/exportAllToExcel', responseType: 'blob'}
    }),
    liquidaciones: Vue.resource('api/liquidaciones', {}, {
        getAll: { method: 'GET', url: 'api/liquidaciones' },
        updateStatus: { method: 'PUT', url: 'api/liquidaciones/updatestatus' },
        sendErp: { method: 'PUT', url: 'api/liquidaciones/sendErp' },
        update: {method: 'PUT', url: 'api/liquidaciones/{id}'},
        sendAllErp: { method: 'PUT', url: 'api/liquidaciones/sendAllErp' },
        updateAllStatus: { method: 'PUT', url: 'api/liquidaciones/updateallstatus' }
    }),
    conceptosclientes: Vue.resource('api/conceptocliente', {}, {
        getAll: { method: 'GET', url: 'api/conceptocliente' },
        updateStatus: { method: 'PUT', url: 'api/conceptocliente/updatestatus' },
        update: {method: 'PUT', url: 'api/conceptocliente/{id}'},
        delete: { method: 'DELETE', url: 'api/conceptocliente/{id}' },
    }),
    condicionPago: Vue.resource('api/condicionpago', {}, {
        getAll: { method: 'GET', url: 'api/condicionpago' },
    }),
    impuesto: Vue.resource('api/impuesto', {}, {
        getAll: { method: 'GET', url: 'api/impuesto' },
    }),
    tipoimpuesto: Vue.resource('api/tipoimpuesto', {}, {
        getAll: { method: 'GET', url: 'api/tipoimpuesto' },
    }),
    tipodocumento: Vue.resource('api/tipodocumento', {}, {
        getAll: { method: 'GET', url: 'api/tipodocumento' },
    }),
    codigoProducto: Vue.resource('api/codigoproducto', {}, {
        getAll: { method: 'GET', url: 'api/codigoproducto' },
    }),
});