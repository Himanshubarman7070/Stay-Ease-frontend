import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Loading from '../../components/Loading';
import { mealAPI } from '../../services/api';

const LABELS = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', morning: 'Morning', night: 'Night' };

export default function AdminMealCancellations() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mealAPI.getAllCancellations().then((r) => setList(r.data.data || [])).finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout><Loading /></DashboardLayout>;

  return (
    <DashboardLayout>
      <header className="page-header">
        <h1>Meal Cancellations</h1>
        <p>All customer meal cancellations — ₹60 each</p>
      </header>
      <section className="glass-card table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Date</th>
              <th>Meal</th>
              <th>Period</th>
              <th>Charge</th>
             
            </tr>
          </thead>
          <tbody>
            {list.map((c) => (
              <tr key={c._id}>
                <td>{c.userId?.name}</td>
                <td>{new Date(c.date).toLocaleDateString()}</td>
                <td>{LABELS[c.mealType]}</td>
                <td>{c.period}</td>
                <td>₹{c.chargeAmount}</td>
               
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </DashboardLayout>
  );
}
