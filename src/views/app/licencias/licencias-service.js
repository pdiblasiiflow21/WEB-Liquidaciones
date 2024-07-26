import baseApi from '../../../api-services'

const url = "licencia";

const get = async(request) => {
    return await baseApi.get(url,request);
}
const create = async(request) => {
    return await baseApi.create(url,request);
}
const update = async(request) => {
    return await baseApi.update(`${url}/${request.id}`,request);
}
const remove = async(id) => {
    await baseApi.delete(`${url}/${id}`);
}

export default ({
    get,
    create,
    update,
    remove
});