const { v4: uuid } = require("uuid");
const helperWrapper = require("../../helpers/wrapper");
const orderModel = require("./orderRepository");
const productModel = require("../product/productRepository");
const midtrans = require("../../helpers/midtrans");

module.exports = {
    getAllOrder: async (req, res) => {
        try {
            const result = await orderModel.getAllOrder();
            if (result.length < 1) {
                return helperWrapper.response(res, 404, ` Request Not Found!`, null);
            }
            return helperWrapper.response(res, 200, "Success Get All Order", result);
        } catch (error) {
            return helperWrapper.response(
                res,
                400,
                `Bad Request (${error.message})`,
                null
            );
        }
    },

    postOrder: async (req, res) => {
        try {
            const {
                idUser,
                idPromo,
                subTotal,
                tax,
                total,
                note,
                paymentMethod,
                paymentStatus,
                orderItem,
            } = req.body;

            const setData = {
                id: uuid(),
                idUser,
                idPromo,
                invoice: "CS-" + Math.random().toString(36).substr(2, 9).toUpperCase(),
                subTotal,
                tax,
                total,
                note,
                paymentMethod,
                paymentStatus,
            };

            // POST ORDER
            await orderModel.postOrder(setData);

            // midtrans proses
            const resultMidtrans = await midtrans.post(setData.id, setData.total);
            // console.log(resultMidtrans);
            // CHECK PRODUCT ID
            orderItem.map(async (item) => {
                const product = await productModel.getProductById(item.productId);
                if (product.length < 1) {
                    return helperWrapper.response(
                        res,
                        404,
                        `Product by id ${item.productId} no found`,
                        null
                    );
                }
            });

            // POST ORDER ITEM
            orderItem.map(async (item) => {
                await orderModel.postOrderItem({
                    orderId: setData.id,
                    id: uuid(),
                    productId: item.productId,
                    qty: item.qty,
                    total: item.total,
                });
            });

            const result = {
                ...setData,
                orderItem,
                urlRedirect: resultMidtrans,
            };

            return helperWrapper.response(res, 200, "Success Create Data", result);
        } catch (error) {
            return helperWrapper.response(
                res,
                400,
                `Bad Request(${error.message})`,
                null
            );
        }
    },

    getOrderByUserId: async (req, res) => {
        try {
            const { idUser } = req.params;
            const result = await orderModel.getOrderByUserId(idUser);
            if (result.length < 1) {
                return helperWrapper.response(
                    res,
                    200,
                    `Data by User Id ${idUser} Not Found!`,
                    []
                );
            }
            return helperWrapper.response(res, 200, "Success Get Order By User Id", result);
        } catch (error) {
            return helperWrapper.response(
                res,
                400,
                `Bad Request (${error.message})`,
                null
            );
        }
    },

    getOrderId: async (req, res) => {
        try {
            const { id } = req.params;
            const result = await orderModel.getOrderId(id);
            if (result.length < 1) {
                return helperWrapper.response(res, 404, ` Id ${id} Not Found!`, null);
            }
            return helperWrapper.response(res, 200, "Success Get By User Id", result);
        } catch (error) {
            return helperWrapper.response(
                res,
                400,
                `Bad Request (${error.message})`,
                null
            );
        }
    },

    deleteOrder: async (req, res) => {
        try {
            const { id } = req.params;
            const checkId = await orderModel.getOrderId(id);
            if (checkId.length < 1) {
                return helperWrapper.response(
                    res,
                    404,
                    `Data by id ${id} not found !`,
                    null
                );
            }
            const result = await orderModel.deleteOrder(id);
            return helperWrapper.response(res, 200, "Success delete data", req.param);
        } catch (error) {
            return helperWrapper.response(
                res,
                400,
                `Bad request (${error.message})`,
                null
            );
        }
    },
    updateOrder: async (req, res) => {
        try {
            const { id } = req.params;
            const checkId = await orderModel.getOrderId(id);
            if (checkId.length < 1) {
                return helperWrapper.response(
                    res,
                    404,
                    `Order by id ${id} not found !`,
                    null
                );
            }

            const { idUser,idPromo,invoice,subTotal,tax,total,note,paymentMethod,paymentStatus } = req.body;
            const setData = {
                idUser,
                idPromo,
                invoice,
                subTotal,                
                tax,
                total,
                note,
                paymentMethod,
                paymentStatus,               
                updatedAt: new Date(Date.now()),
            };
            Object.keys(setData).forEach((data) => {
                if (!setData[data]) {
                    delete setData[data];
                }
            });
            
            const result = await orderModel.updateOrder(setData, id);
            return helperWrapper.response(
                res,
                200,
                "Success update order data",
                result
            );
        } catch (error) {
            return helperWrapper.response(
                res,
                400,
                `Bad request (${error.message})`,
                null
            );
        }
    },
};