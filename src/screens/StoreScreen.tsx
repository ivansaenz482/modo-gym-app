import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, Pressable, TextInput, Modal, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Linking } from 'react-native';
import { colors } from '../theme/colors';
import { appFont, statFont } from '../theme/fonts';
import { useStore } from '../store/storeStore';
import { Product, CATEGORIES, addProduct, updateProduct, deleteProduct, seedProducts, uploadProductImage } from '../services/storeService';
import { seedCatalog } from '../data/seedCatalog';
import { isFirebaseConfigured, checkAdminPin } from '../config/firebase';
import { useUserStore } from '../store/userStore';
import * as ImagePicker from 'expo-image-picker';
import { MenuButton } from '../components/ui/MenuButton';

const WA = '593968536103';

type ProductForm = { name: string; category: string; price: string; stock: string; description: string; image: string };

export function StoreScreen() {
  const configured = isFirebaseConfigured();
  const [admin, setAdmin] = useState(false);
  const { products, loading, error, subscribe } = useStore();
  const { profile } = useUserStore();
  const [modal, setModal] = useState(false);
  const [pinOpen, setPinOpen] = useState(false);
  const [pin, setPin] = useState('');
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>({ name: '', category: CATEGORIES[0], price: '', stock: '', description: '', image: '' });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [catFilter, setCatFilter] = useState('Todos');

  // Pedir PIN para entrar en modo admin
  const tryUnlock = () => {
    if (checkAdminPin(pin)) { setAdmin(true); setPinOpen(false); setPin(''); }
    else Alert.alert('PIN incorrecto', 'El PIN no es válido. Intenta de nuevo.');
  };
  const lock = () => { setAdmin(false); };

  // Seleccionar foto desde la galería
  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Alert.alert('Permiso', 'Necesitas permitir el acceso a tus fotos.'); return; }
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7, base64: true });
    if (!res.canceled && res.assets?.[0]) {
      const a = res.assets![0];
      setForm((f) => ({ ...f, image: a.base64 ? `data:image/jpeg;base64,${a.base64}` : a.uri }));
    }
  };

  useEffect(() => {
    const unsub = subscribe();
    return unsub;
  }, []);

  const visible = catFilter === 'Todos' ? products : products.filter((p) => p.category === catFilter);

  const openNew = () => { setEditing(null); setForm({ name: '', category: CATEGORIES[0], price: '', stock: '', description: '', image: '' }); setModal(true); };
  const openEdit = (p: Product) => { setEditing(p); setForm({ name: p.name, category: p.category, price: String(p.price), stock: String(p.stock), description: p.description || '', image: p.image || '' }); setModal(true); };

  const loadCatalog = () => {
    Alert.alert('Cargar catálogo inicial', 'Se agregarán productos de ejemplo (camisas, tazas, gorras, llaveros, perfumes...). Puedes editarlos después. ¿Continuar?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sí, cargar', onPress: async () => { if (!admin) return setPinOpen(true); try { await seedProducts(seedCatalog); Alert.alert('✓ Listo', 'Catálogo cargado.'); } catch { Alert.alert('Error', 'No se pudo cargar. Revisa Firestore.'); } } },
    ]);
  };

  const save = async () => {
    if (!form.name || !form.price) return Alert.alert('Completa nombre y precio');
    setSaving(true);
    let imagen = form.image.trim();
    try {
      // Si la imagen es un archivo local (no un link http), subirla a Firebase Storage
      if (imagen && !imagen.startsWith('http')) {
        setUploading(true);
        imagen = await uploadProductImage(imagen);
        setUploading(false);
      }
      const data = { name: form.name.trim(), category: form.category, price: Number(form.price) || 0, stock: Number(form.stock) || 0, description: form.description.trim(), image: imagen, active: true };
      if (editing) await updateProduct(editing.id, data);
      else await addProduct(data);
      setModal(false);
      Alert.alert('✓ Guardado', `Producto "${form.name}" ${editing ? 'actualizado' : 'agregado'}.`);
    } catch (e: any) {
      setUploading(false);
      Alert.alert('Error al guardar', `Detalle: ${e?.message || 'desconocido'}. Revisa Firestore/ImgBB e internet.`);
    } finally { setSaving(false); setUploading(false); }
  };

  const remove = (p: Product) => {
    Alert.alert('Eliminar producto', `¿Borrar "${p.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => { try { await deleteProduct(p.id); } catch { Alert.alert('Error', 'No se pudo eliminar.'); } } },
    ]);
  };

  const order = (p: Product) => {
    const msg = `Hola MODO-GYM 💪%0AQuiero pedir: *${p.name}* (${p.category}) — ${p.price} USD.%0A${
      profile ? '%0ADe parte: ' + profile.name : ''
    }`;
    Linking.openURL(`https://wa.me/${WA}?text=${msg}`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: 16 }}>
        <LinearGradient colors={[colors.surface, colors.surface2]} style={styles.header}>
          <View style={styles.iconBadge}><Ionicons name="bag-handle" size={26} color="#fff" /></View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.headerTxt}>Tienda MODO-GYM</Text>
            <Text style={styles.headerSub}>{configured ? `${products.length} productos en stock` : 'Tienda vacía o sin configurar'}</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
            {admin ? (
              <>
                <Pressable onPress={loadCatalog} style={styles.addBtn2}><Ionicons name="download" size={16} color="#fff" /></Pressable>
                <Pressable onPress={openNew} style={styles.addBtn}><Ionicons name="add" size={18} color="#fff" /></Pressable>
                <Pressable onPress={lock} style={styles.addBtn3}><Ionicons name="lock-closed" size={15} color="#fff" /></Pressable>
              </>
            ) : (
              <Pressable onPress={() => setPinOpen(true)} style={styles.adminUnlock}><Ionicons name="lock-open" size={15} color="#0EA5E9" /><Text style={styles.adminUnlockTxt}>ADMIN</Text></Pressable>
            )}
            <MenuButton />
          </View>
        </LinearGradient>

        {!configured && (
          <View style={styles.notice}>
            <Ionicons name="cloud-offline" size={18} color={colors.warning} />
            <Text style={{ color: '#D1D5DB', fontSize: 12, flex: 1, marginLeft: 8 }}>La tienda necesita configurarse con Firebase para mostrar los productos de la dueña. Contacta al administrador.</Text>
          </View>
        )}
        {error && <Text style={{ color: colors.error, fontSize: 12, marginTop: 8 }}>Error de conexión: {error}</Text>}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginTop: 12 }}>
          {['Todos', ...CATEGORIES].map((c) => (
            <Pressable key={c} onPress={() => setCatFilter(c)} style={[styles.chip, catFilter === c && styles.chipActive]}>
              <Text style={[styles.chipTxt, catFilter === c && { color: '#fff' }]}>{c}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator color={colors.primary} /><Text style={{ color: '#9CA3AF', marginTop: 10 }}>Cargando tienda...</Text></View>
      ) : visible.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="pricetags-outline" size={44} color="#6B7280" />
          <Text style={{ color: '#9CA3AF', marginTop: 12, textAlign: 'center' }}>{configured ? 'Aún no hay productos en esta categoría' : 'La tienda no está conectada aún'}</Text>
          {admin && configured && <Pressable onPress={openNew} style={styles.emptyBtn}><Text style={{ color: '#fff', fontWeight: '800' }}>+ AGREGAR PRODUCTO</Text></Pressable>}
        </View>
      ) : (
        <FlatList
          data={visible}
          keyExtractor={(i) => i.id}
          numColumns={2}
          contentContainerStyle={{ padding: 8, paddingBottom: 20 }}
          columnWrapperStyle={{ gap: 8 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              {item.image ? <Image source={{ uri: item.image }} style={styles.img} resizeMode="contain" /> : <View style={[styles.img, { alignItems: 'center', justifyContent: 'center' }]}><Ionicons name="image" size={30} color="#6B7280" /></View>}
              {admin && (
                <View style={styles.adminRow}>
                  <Pressable onPress={() => openEdit(item)} style={styles.adminBtn}><Ionicons name="pencil" size={13} color="#fff" /></Pressable>
                  <Pressable onPress={() => remove(item)} style={styles.adminBtn}><Ionicons name="trash" size={13} color="#fff" /></Pressable>
                </View>
              )}
              <View style={{ padding: 10 }}>
                <Text style={{ color: '#fff', fontWeight: '800', fontSize: 12 }} numberOfLines={2}>{item.name}</Text>
                <Text style={{ color: '#9CA3AF', fontSize: 10, marginTop: 2 }}>{item.category} · Stock: {item.stock}</Text>
                {item.description ? <Text style={{ color: '#6B7280', fontSize: 10, marginTop: 2 }} numberOfLines={1}>{item.description}</Text> : null}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                  <Text style={{ color: colors.primary, fontWeight: '900', fontSize: 16, fontFamily: statFont.bold }}>${item.price}</Text>
                  <Pressable onPress={() => order(item)} style={styles.orderBtn}><Ionicons name="logo-whatsapp" size={13} color="#fff" /><Text style={{ color: '#fff', fontSize: 10, fontWeight: '800' }}>PEDIR</Text></Pressable>
                </View>
              </View>
            </View>
          )}
        />
      )}

      <Modal visible={modal} animationType="slide" onRequestClose={() => setModal(false)}>
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          <View style={styles.modalHeader}>
            <Text style={{ color: '#fff', fontWeight: '900', fontSize: 16 }}>{editing ? 'Editar producto' : 'Agregar producto'}</Text>
            <Pressable onPress={() => setModal(false)}><Ionicons name="close" size={22} color="#fff" /></Pressable>
          </View>
          <ScrollView contentContainerStyle={{ padding: 16 }}>
            <Text style={styles.lbl}>NOMBRE</Text>
            <TextInput value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} placeholder="Ej: Creatina 300g" placeholderTextColor="#6B7280" style={styles.input} />
            <Text style={styles.lbl}>CATEGORÍA</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {CATEGORIES.map((c) => (
                <Pressable key={c} onPress={() => setForm({ ...form, category: c })} style={[styles.chip, form.category === c && styles.chipActive]}>
                  <Text style={[styles.chipTxt, form.category === c && { color: '#fff' }]}>{c}</Text>
                </Pressable>
              ))}
            </View>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
              <View style={{ flex: 1 }}><Text style={styles.lbl}>PRECIO (USD)</Text><TextInput value={form.price} onChangeText={(v) => setForm({ ...form, price: v })} keyboardType="numeric" placeholder="0.00" placeholderTextColor="#6B7280" style={styles.input} /></View>
              <View style={{ flex: 1 }}><Text style={styles.lbl}>STOCK</Text><TextInput value={form.stock} onChangeText={(v) => setForm({ ...form, stock: v })} keyboardType="numeric" placeholder="0" placeholderTextColor="#6B7280" style={styles.input} /></View>
            </View>
            <Text style={styles.lbl}>DESCRIPCIÓN</Text>
            <TextInput value={form.description} onChangeText={(v) => setForm({ ...form, description: v })} placeholder="Breve descripción" placeholderTextColor="#6B7280" style={styles.input} multiline />
            <Text style={styles.lbl}>FOTO</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Pressable onPress={pickImage} style={styles.pickBtn}>
                <Ionicons name="image" size={16} color="#fff" />
                <Text style={{ color: '#fff', fontWeight: '800', fontSize: 12 }}>ELEGIR DEL CELULAR</Text>
              </Pressable>
              <TextInput value={form.image.startsWith('http') ? '' : form.image} onChangeText={(v) => setForm({ ...form, image: v })} placeholder="o pega una URL http..." placeholderTextColor="#6B7280" style={[styles.input, { flex: 1, marginBottom: 0 }]} autoCapitalize="none" />
            </View>
            {form.image ? <Image source={{ uri: form.image }} style={{ width: '100%', height: 180, borderRadius: 12, marginTop: 8, backgroundColor: colors.surface3 }} resizeMode="contain" /> : null}
            <Pressable onPress={save} disabled={saving || uploading} style={styles.saveBtn}>
              {saving || uploading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '900' }}>{editing ? 'GUARDAR CAMBIOS' : 'AGREGAR PRODUCTO'}</Text>}
            </Pressable>
          </ScrollView>
        </View>
      </Modal>

      {/* Modal de PIN administrador */}
      <Modal visible={pinOpen} transparent animationType="fade" onRequestClose={() => setPinOpen(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <View style={{ backgroundColor: colors.surface, borderRadius: 18, padding: 20, width: '100%', borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ color: '#fff', fontWeight: '900', fontSize: 16, textAlign: 'center' }}>🔐 Acceso administrador</Text>
            <Text style={{ color: '#9CA3AF', fontSize: 12, textAlign: 'center', marginTop: 6 }}>Ingresa el PIN para gestionar el catálogo</Text>
            <TextInput value={pin} onChangeText={setPin} keyboardType="number-pad" secureTextEntry maxLength={8} placeholder="PIN" placeholderTextColor="#6B7280" style={styles.pinInput} />
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
              <Pressable onPress={() => setPinOpen(false)} style={[styles.saveBtn, { backgroundColor: colors.surface3 }]}><Text style={{ color: '#fff', fontWeight: '800' }}>Cancelar</Text></Pressable>
              <Pressable onPress={tryUnlock} style={[styles.saveBtn, { flex: 2 }]}><Text style={{ color: '#fff', fontWeight: '900' }}>DESBLOQUEAR</Text></Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, padding: 14, borderWidth: 1, borderColor: colors.border },
  iconBadge: { width: 52, height: 52, borderRadius: 16, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  headerTxt: { color: '#fff', fontWeight: '900', fontSize: 16, fontFamily: appFont.black },
  headerSub: { color: colors.textSecondary, fontSize: 12, marginTop: 3 },
  addBtn: { backgroundColor: colors.primary, borderRadius: 12, width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  addBtn2: { backgroundColor: colors.surface3, borderRadius: 12, width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  addBtn3: { backgroundColor: colors.success, borderRadius: 12, width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  adminUnlock: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(14,165,233,0.12)', borderRadius: 12, paddingHorizontal: 12, height: 38, borderWidth: 1, borderColor: 'rgba(14,165,233,0.4)' },
  adminUnlockTxt: { color: '#0EA5E9', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  notice: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface2, borderRadius: 12, padding: 12, marginTop: 12, borderWidth: 1, borderColor: colors.border },
  chip: { backgroundColor: colors.surface, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipTxt: { color: '#9CA3AF', fontWeight: '700', fontSize: 12 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  emptyBtn: { backgroundColor: colors.primary, borderRadius: 12, padding: 12, marginTop: 16 },
  card: { flex: 1, backgroundColor: colors.surface, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, marginBottom: 8 },
  img: { width: '100%', height: 140, backgroundColor: colors.surface3 },
  adminRow: { position: 'absolute', top: 8, right: 8, flexDirection: 'row', gap: 6 },
  adminBtn: { backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 8, width: 26, height: 26, alignItems: 'center', justifyContent: 'center' },
  orderBtn: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#25D366', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  lbl: { color: '#9CA3AF', fontSize: 10, fontWeight: '700', letterSpacing: 0.8, marginBottom: 6, marginTop: 8 },
  input: { backgroundColor: colors.surface2, borderRadius: 12, padding: 12, color: '#fff', borderWidth: 1, borderColor: colors.border, marginBottom: 8 },
  pickBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.surface3, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12, borderWidth: 1, borderColor: colors.border },
  pinInput: { backgroundColor: colors.surface2, borderRadius: 12, padding: 14, color: '#fff', borderWidth: 1, borderColor: colors.border, marginTop: 14, fontSize: 22, textAlign: 'center', letterSpacing: 8 },
  saveBtn: { backgroundColor: colors.primary, borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 14 },
});
