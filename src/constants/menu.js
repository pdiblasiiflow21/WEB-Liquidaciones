import Vue from 'vue'
import Vuex from 'vuex'
import vuexStore from '../store/index';

  

const data = [
  {
    id: "ordenespagos",
    icon: "receipt",
    label: "Órdenes de Pago",
    to: "/app/ordenespagos"
  },
  {
    id: "envios",
    icon: "receipt",
    label: "Envíos",
    to: "/app/envios"
  },
  {
    id: "liquidaciones",
    icon: "cash",
    label: "Liquidaciones",
    to: "/app/liquidaciones"
  },
  {
    id: "conceptosclientes",
    icon: "receipt",
    label: "Conceptos x Cliente",
    to: "/app/conceptosclientes"
  },
  {
    id: "tablas",
    icon: "nut",
    label: "Maestros",
    subs: [{
      id: "conceptos",
      icon: "simple-icon-paper-plane",
      label: "Conceptos",
      to: "/app/tablas/conceptos" 
    },
    {
      id: "clientes",
      icon: "simple-icon-paper-plane",
      label: "Clientes",
      to: "/app/tablas/clientes" 
    },
    ]
  } 
];

function dataX(params) {
 
  return params;
}  

 

export default dataX(data);