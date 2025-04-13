import ShippingAddress from "../models/ShippingAddress.js";

class ShippingAddressController {
  // ================================
  // POST: Tambah alamat baru
  // ================================
  async postShippingAddress(req, res) {
    try {
      const userId = req.jwt.id;

      const {
        recipient_name,
        phone_number,
        address,
        city,
        postal_code,
        note,
      } = req.body;

      // Validasi field wajib
      if (
        !recipient_name ||
        !phone_number ||
        !address ||
        !city ||
        !postal_code
      ) {
        return res.status(400).json({
          status: false,
          message: "FIELDS_MUST_BE_FILLED",
        });
      }

      // Simpan data alamat baru
      const shippingAddress = await ShippingAddress.create({
        userId,
        recipient_name,
        phone_number,
        address,
        city,
        postal_code,
        note,
      });

      // Response sukses
      return res.status(201).json({
        status: true,
        message: "SUCCESS_ADD_SHIPPING_ADDRESS",
        data: {
          id: shippingAddress._id,
          recipient_name: shippingAddress.recipient_name,
          phone_number: shippingAddress.phone_number,
          address: shippingAddress.address,
          city: shippingAddress.city,
          postal_code: shippingAddress.postal_code,
          note: shippingAddress.note,
        },
      });
    } catch (error) {
      return res.status(error.code || 500).json({
        status: false,
        message: error.message || "INTERNAL_SERVER_ERROR",
      });
    }
  }

  // ================================
  // GET: Lihat semua alamat user
  // ================================
  async getShippingAddress(req, res) {
    try {
      const userId = req.jwt.id;

      const shippingAddress = await ShippingAddress.find({ userId });

      if (shippingAddress.length === 0) {
        return res.status(404).json({
          status: false,
          message: "SHIPPING_ADDRESS_NOT_FOUND",
        });
      }

      // Format data
      const enrichedShippingAddress = shippingAddress.map((address) => ({
        id: address._id,
        recipient_name: address.recipient_name,
        phone_number: address.phone_number,
        address: address.address,
        city: address.city,
        postal_code: address.postal_code,
        note: address.note,
      }));

      return res.status(200).json({
        status: true,
        message: "SUCCESS_GET_SHIPPING_ADDRESS",
        data: enrichedShippingAddress,
      });
    } catch (error) {
      return res.status(error.code || 500).json({
        status: false,
        message: error.message || "INTERNAL_SERVER_ERROR",
      });
    }
  }

  // ================================
  // PUT: Edit alamat by ID
  // ================================
  async putShippingAddress(req, res) {
    try {
      const userId = req.jwt.id;
      const { id } = req.params;

      const {
        recipient_name,
        phone_number,
        address,
        city,
        postal_code,
        note,
      } = req.body;

      // Validasi field wajib
      if (
        !recipient_name ||
        !phone_number ||
        !address ||
        !city ||
        !postal_code
      ) {
        return res.status(400).json({
          status: false,
          message: "FIELDS_MUST_BE_FILLED",
        });
      }

      // Cari dan update alamat
      const updatedAddress = await ShippingAddress.findOneAndUpdate(
        { _id: id, userId },
        {
          recipient_name,
          phone_number,
          address,
          city,
          postal_code,
          note,
        },
        { new: true }
      );

      // Cek jika data tidak ditemukan
      if (!updatedAddress) {
        return res.status(404).json({
          status: false,
          message: "SHIPPING_ADDRESS_NOT_FOUND",
        });
      }

      return res.status(200).json({
        status: true,
        message: "SUCCESS_UPDATE_SHIPPING_ADDRESS",
        data: {
          id: updatedAddress._id,
          recipient_name: updatedAddress.recipient_name,
          phone_number: updatedAddress.phone_number,
          address: updatedAddress.address,
          city: updatedAddress.city,
          postal_code: updatedAddress.postal_code,
          note: updatedAddress.note,
        },
      });
    } catch (error) {
      return res.status(error.code || 500).json({
        status: false,
        message: error.message || "INTERNAL_SERVER_ERROR",
      });
    }
  }

  // ================================
  // DELETE: Hapus alamat by ID
  // ================================
  async deleteShippingAddress(req, res) {
    try {
      const userId = req.jwt.id;
      const { id } = req.params;

      const deleted = await ShippingAddress.findOneAndDelete({
        _id: id,
        userId,
      });

      if (!deleted) {
        return res.status(404).json({
          status: false,
          message: "SHIPPING_ADDRESS_NOT_FOUND",
        });
      }

      return res.status(200).json({
        status: true,
        message: "SUCCESS_DELETE_SHIPPING_ADDRESS",
        data: {
          id: deleted._id,
          recipient_name: deleted.recipient_name,
          phone_number: deleted.phone_number,
          address: deleted.address,
          city: deleted.city,
          postal_code: deleted.postal_code,
          note: deleted.note,
        },
      });
    } catch (error) {
      return res.status(error.code || 500).json({
        status: false,
        message: error.message || "INTERNAL_SERVER_ERROR",
      });
    }
  }
}

export default new ShippingAddressController();