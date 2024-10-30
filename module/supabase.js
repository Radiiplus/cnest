const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');

const DATA_FOLDER = path.join(__dirname, '..', 'data');
const KEYS_FILE = path.join(DATA_FOLDER, 'keys.json');

let supabase;

const initializeSupabase = async () => {
  const { SUPABASE_URL, SUPABASE_KEY } = JSON.parse(await fs.readFile(KEYS_FILE, 'utf-8'));
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
};

const addItem = async (table, data) => {
  if (!supabase) await initializeSupabase();
  const { data: result, error } = await supabase.from(table).insert([data]);
  if (error) throw error;
  return result;
};

const getItem = async (table, field, value) => {
  if (!supabase) await initializeSupabase();
  const { data, error } = await supabase.from(table).select('*').eq(field, value);
  if (error) throw error;
  return data.length > 0 ? data[0] : null;
};

const updateItem = async (table, filters, data) => {
  if (!supabase) await initializeSupabase();
  const { data: result, error } = await supabase.from(table).update(data).match(filters);
  if (error) throw error;
  return result;
};

const deleteItem = async (table, filters) => {
  if (!supabase) await initializeSupabase();
  const { data: result, error } = await supabase.from(table).delete().match(filters);
  if (error) throw error;
  return result;
};

module.exports = { addItem, getItem, updateItem, deleteItem };