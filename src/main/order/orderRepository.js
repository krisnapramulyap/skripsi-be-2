const connection = require("../../config/database");

module.exports = {
    postOrder: (data) =>
        new Promise((resolve, reject) => {
            connection.query("INSERT INTO `order` SET ?", data, (err, result) => {
                if (!err) {
                    const newResult = {
                        id: result.insertId,
                        ...data,
                    };
                    resolve(newResult);
                } else {
                    reject(new Error(`SQL: ${err.sqlMessage}`));
                }
            });
        }),

    postOrderItem: (data) =>
        new Promise((resolve, reject) => {
            connection.query("INSERT INTO `orderitem` SET ?", data, (err, result) => {
                if (!err) {
                    resolve(result);
                } else {
                    reject(new Error(`SQL: ${err.sqlMessage}`));
                }
            });
        }),
    getOrderByUserId: (idUser) =>
        new Promise((resolve, reject) => {
            connection.query(
                "SELECT orderitem.orderId, orderitem.productId, product.name, `order`.* " +
                "FROM `orderitem` " +
                "LEFT JOIN product ON product.id = orderitem.productId " +
                "LEFT JOIN `order` ON `order`.id = orderitem.orderId " +
                "WHERE `order`.idUser = ?",
                idUser,
                (error, result) => {
                    if (!error) {
                        resolve(result);
                    } else {
                        reject(new Error(`SQL: ${error.sqlMessage}`));
                    }
                }
            );
        }),

    getOrderId: (id) =>
        new Promise((resolve, reject) => {
            connection.query(
                "SELECT * FROM `order` WHERE id = ?",
                id,
                (error, result) => {
                    if (!error) {
                        resolve(result);
                    } else new Error(`SQL:${error.sqlMessage}`);
                }
            );
        }),
    getAllOrder: () =>
        new Promise((resolve, reject) => {
            connection.query(
                "SELECT oi.orderId, oi.productId, oi.qty, oi.total, p.name, p.image, p.size, p.price, p.description, p.category, oup.* " +
                "FROM orderitem oi " +
                "LEFT JOIN product p ON p.id = oi.productId " +
                "LEFT JOIN ( " +
                "  SELECT o.id, o.idUser, o.idPromo, o.invoice, o.tax, o.subTotal, o.total, o.note,o.paymentMethod, o.paymentStatus, " +
                "    u.displayName, u.firstName, u.lastName, u.email, u.image, u.phoneNumber, u.deliveryAddress, u.gender, u.status, u.role, u.birthDay, " +
                "    promo.name AS promoName, promo.discount, promo.image AS promoImage, promo.minTotalPrice, promo.maxDiscount, promo.promoCode, " +
                "    promo.description, promo.dateStart, promo.dateEnd " +
                "  FROM `order` o " +
                "  LEFT JOIN user u ON u.id = o.idUser " +
                "  LEFT JOIN promo ON promo.id = o.idPromo " +
                ") oup ON oup.id = oi.orderId WHERE oup.id IS NOT NULL",
                (error, result) => {
                    if (!error) {
                        resolve(result);
                    } else {
                        reject(new Error(`SQL Error: ${error.sqlMessage}`));
                    }
                }
            );
        }),

    deleteOrder: (id) =>
        new Promise((resolve, reject) => {
            connection.query(
                "DELETE FROM `order` WHERE id=?",
                id,
                (error, result) => {
                    if (!error) {
                        resolve(id);
                    } else {
                        reject(new Error(`SQL : ${error.sqlMessage}`));
                    }
                }
            );
        }),
    updateOrder: (data, id) =>
        new Promise((resolve, reject) => {
            connection.query(
                "UPDATE `order` SET ? WHERE id = ?",
                [data, id],
                (error, results) => {
                    if (!error) {
                        const newResult = {
                            id,
                            ...data,
                        };
                        resolve(newResult);
                    } else {
                        reject(new Error(`Message ${error.message}`));
                    }
                }
            );
        }),
};