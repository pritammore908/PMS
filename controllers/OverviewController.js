const Overview = require("../models/OverviewModel");

exports.createOverview = async (req, res) => {
  try {
    const data = await Overview.create(req.body);
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json(error);
  }
};

exports.getOverview = async (req, res) => {
  try {
    const list = await Overview.find();
    res.status(200).json(list);
  } catch (error) {
    res.status(500).json(error);
  }
};

exports.updateOverview = async (req, res) => {
  try {
    const id = req.params.id;
    const updated = await Overview.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json(error);
  }
};

exports.deleteOverview = async (req, res) => {
  try {
    await Overview.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json(error);
  }
};