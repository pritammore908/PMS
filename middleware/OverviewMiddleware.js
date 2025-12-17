module.exports.validateOverview = (req, res, next) => {
  const { series, employee, company, appraisalCycle } = req.body;
  if (!series || !employee || !company || !appraisalCycle) {
    return res.status(400).json({ message: "series, employee, company and appraisalCycle are required" });
  }
  // basic appraisal cycle format check (digits and dash allowed)
  if (!/^[0-9-]+$/.test(appraisalCycle)) {
    return res.status(400).json({ message: "appraisalCycle should contain only digits and dash (e.g. 2023-2024)" });
  }
  next();
};
