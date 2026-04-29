import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Image, ActivityIndicator, Alert, ScrollView
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function HomeScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [plate, setPlate] = useState("");
  const [loading, setLoading] = useState(false);

  const SERVER_URL = "http://3.80.139.188:8720/predict/";

  const pickImage = async (camera: boolean) => {
    const permission = camera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permiso denegado");
      return;
    }

    const result = camera
      ? await ImagePicker.launchCameraAsync({ quality: 1 })
      : await ImagePicker.launchImageLibraryAsync({ quality: 1 });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImage(uri);
      sendToServer(uri);
    }
  };

  const clearAll = () => {
    setImage(null);
    setPlate("");
    setLoading(false);
  };

  const sendToServer = async (uri: string) => {
    setLoading(true);
    setPlate("");

    try {
      const formData = new FormData();
      const fileName = uri.split('/').pop() || 'photo.jpg';

      // @ts-ignore
      formData.append('file', {
        uri,
        name: fileName,
        type: 'image/jpeg',
      });

      const res = await fetch(SERVER_URL, {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' },
      });

      const data = await res.json();

      if (data.success) {
        setPlate(data.placas?.[0] || "No detectada");

        if (data.image) {
          setImage(`data:image/jpeg;base64,${data.image}`);
        }
      } else {
        setPlate("Error en detección");
      }

    } catch (e) {
      Alert.alert("Error", "Servidor caído o lento");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>

      <Text style={styles.title}>🚗 Detector de Placas</Text>

      {/* 🔥 IMAGEN GRANDE */}
      <View style={styles.imageBox}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} resizeMode="contain" />
        ) : (
          <Text style={styles.placeholder}>Selecciona una imagen</Text>
        )}
      </View>

      {/* 🔥 RESULTADO */}
      <View style={styles.result}>
        {loading ? (
          <ActivityIndicator size="large" />
        ) : (
          <>
            <Text style={styles.label}>PLACA DETECTADA</Text>
            <Text style={styles.plate}>{plate || "---"}</Text>
          </>
        )}
      </View>

      {/* 🔥 BOTONES */}
      <View style={styles.buttons}>
        <TouchableOpacity style={styles.btn} onPress={() => pickImage(true)}>
          <Text style={styles.btnText}>📷 Cámara</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.btn, styles.green]} onPress={() => pickImage(false)}>
          <Text style={styles.btnText}>🖼️ Galería</Text>
        </TouchableOpacity>
      </View>

      {/* 🔥 BOTÓN LIMPIAR */}
      <TouchableOpacity style={styles.clearBtn} onPress={clearAll}>
        <Text style={styles.clearText}>🧹 Limpiar</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#F5F7FA"
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15
  },

  // 🔥 MÁS GRANDE Y PROPORCIONAL
  imageBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    height: 420,   // 👈 antes 300 → ahora más grande
    marginBottom: 20,
    justifyContent: "center"
  },

  image: {
    width: "100%",
    height: "100%"
  },

  placeholder: {
    textAlign: "center",
    color: "#aaa"
  },

  result: {
    alignItems: "center",
    marginBottom: 20
  },

  label: {
    fontSize: 12,
    color: "#777"
  },

  plate: {
    fontSize: 40,  // 👈 más grande
    fontWeight: "bold",
    color: "#2196F3"
  },

  buttons: {
    flexDirection: "row",
    gap: 10
  },

  btn: {
    flex: 1,
    backgroundColor: "#2196F3",
    padding: 15,
    borderRadius: 10,
    alignItems: "center"
  },

  green: {
    backgroundColor: "#4CAF50"
  },

  btnText: {
    color: "#fff",
    fontWeight: "bold"
  },

  // 🔥 BOTÓN LIMPIAR
  clearBtn: {
    marginTop: 15,
    backgroundColor: "#E53935",
    padding: 12,
    borderRadius: 10,
    alignItems: "center"
  },

  clearText: {
    color: "#fff",
    fontWeight: "bold"
  }
});