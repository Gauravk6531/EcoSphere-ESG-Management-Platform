import EnvironmentalGoal from '../models/EnvironmentalGoal.js';

export const getGoals = async (req, res) => {
  try {
    const { departmentId } = req.query;
    const query = departmentId ? { department: departmentId } : {};
    const goals = await EnvironmentalGoal.find(query).populate('department', 'name code');
    res.status(200).json({ status: 'success', data: goals });
  } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
};

export const createGoal = async (req, res) => {
  try {
    const { title, departmentId, targetValue, currentValue, unit, startDate, endDate } = req.body;
    const goal = await EnvironmentalGoal.create({
      title, department: departmentId || null, targetValue, currentValue: currentValue || 0, unit, startDate, endDate,
    });
    res.status(201).json({ status: 'success', data: goal });
  } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
};

export const updateGoal = async (req, res) => {
  try {
    let goal = await EnvironmentalGoal.findById(req.params.id);
    if (!goal) return res.status(404).json({ status: 'error', message: 'Goal not found' });
    Object.assign(goal, req.body);
    if (goal.currentValue >= goal.targetValue) goal.status = 'Completed';
    const updated = await goal.save();
    res.status(200).json({ status: 'success', data: updated });
  } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
};

export const deleteGoal = async (req, res) => {
  try {
    const goal = await EnvironmentalGoal.findByIdAndDelete(req.params.id);
    if (!goal) return res.status(404).json({ status: 'error', message: 'Goal not found' });
    res.status(200).json({ status: 'success', message: 'Goal deleted' });
  } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
};
