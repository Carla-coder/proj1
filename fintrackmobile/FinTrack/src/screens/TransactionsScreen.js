// import React from "react";
// import { View, Text, FlatList, StyleSheet } from "react-native";

// const transactions = [
//   {
//     date: "10/06/2023",
//     description: "Supermercado",
//     category: "Alimentação",
//     amount: "-R$ 250,00",
//   },
//   {
//     date: "08/06/2023",
//     description: "Salário",
//     category: "Renda",
//     amount: "+R$ 3.500,00",
//   },
//   {
//     date: "05/06/2023",
//     description: "Conta de Luz",
//     category: "Utilidades",
//     amount: "-R$ 120,00",
//   },
// ];

// export default function TransactionsScreen() {
//   return (
//     <View style={styles.container}>
//       <FlatList
//         data={transactions}
//         keyExtractor={(item, index) => index.toString()}
//         renderItem={({ item }) => (
//           <View style={styles.transaction}>
//             <Text>{item.date}</Text>
//             <Text>{item.description}</Text>
//             <Text>{item.category}</Text>
//             <Text
//               style={[
//                 styles.amount,
//                 item.amount.startsWith("+") ? styles.income : styles.expense,
//               ]}
//             >
//               {item.amount}
//             </Text>
//           </View>
//         )}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     padding: 20,
//   },
//   transaction: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     padding: 15,
//     borderRadius: 10,
//     backgroundColor: "#fff",
//     marginBottom: 10,
//     elevation: 2,
//   },
//   amount: {
//     fontSize: 16,
//   },
//   income: {
//     color: "green",
//   },
//   expense: {
//     color: "red",
//   },
// });


import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Picker,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Suponho que transactions sejam carregadas de AsyncStorage na vida real.
// Se não for o caso, você pode mover a lógica de carga do `DashboardScreen` para cá.

export default function TransactionsScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [transactions, setTransactions] = useState([]);

  // Carregar transações salvas
  React.useEffect(() => {
    const loadTransactions = async () => {
      try {
        const savedTransactions = await AsyncStorage.getItem("transactions");
        if (savedTransactions !== null) {
          setTransactions(JSON.parse(savedTransactions));
        }
      } catch (error) {
        console.error("Erro ao carregar transações:", error);
      }
    };

    loadTransactions();
  }, []);

  const handleAddTransaction = async () => {
    if (description && amount && date && category && type) {
      const newTransaction = {
        id: transactions.length + 1,
        description,
        amount: parseFloat(amount),
        date,
        category,
        type,
      };

      const updatedTransactions = [...transactions, newTransaction];
      setTransactions(updatedTransactions);

      // Salvar no AsyncStorage
      try {
        await AsyncStorage.setItem(
          "transactions",
          JSON.stringify(updatedTransactions)
        );
      } catch (error) {
        console.error("Erro ao salvar transações:", error);
      }

      setDescription("");
      setAmount("");
      setDate("");
      setCategory("");
      setType("");
      setModalVisible(false);
    } else {
      alert("Por favor, preencha todos os campos.");
    }
  };

  const formatDate = (text) => {
    const numbers = text.replace(/\D/g, "");
    let formattedDate = "";

    if (numbers.length > 0) {
      formattedDate += numbers.slice(0, 2); // Dia
    }
    if (numbers.length >= 3) {
      formattedDate += "/" + numbers.slice(2, 4); // Mês
    }
    if (numbers.length >= 5) {
      formattedDate += "/" + numbers.slice(4, 8); // Ano
    }

    setDate(formattedDate);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.transactionItem}>
            <Text>{item.date}</Text>
            <Text>{item.description}</Text>
            <Text>{item.category}</Text>
            <Text>{item.type}</Text>
            <Text
              style={[
                styles.transactionAmount,
                { color: item.type === "renda" ? "blue" : "red" },
              ]}
            >
              {item.type === "renda"
                ? `+ R$ ${item.amount.toFixed(2)}`
                : `- R$ ${item.amount.toFixed(2)}`}
            </Text>
          </View>
        )}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Adicionar Nova Transação</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>X</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Data (DD/MM/AAAA)"
              value={date}
              onChangeText={formatDate}
            />

            <TextInput
              style={styles.input}
              placeholder="Descrição"
              value={description}
              onChangeText={setDescription}
            />

            <Picker
              selectedValue={category}
              style={styles.picker}
              onValueChange={(itemValue) => setCategory(itemValue)}
            >
              <Picker.Item label="Selecione a Categoria" value="" />
              <Picker.Item label="Alimentação" value="Alimentação" />
              <Picker.Item label="Renda Fixa" value="Renda Fixa" />
              <Picker.Item label="Transporte" value="Transporte" />
              <Picker.Item label="Moradia" value="Moradia" />
              <Picker.Item label="Lazer" value="Lazer" />
              <Picker.Item label="Educação" value="Educação" />
              <Picker.Item label="Saúde" value="Saúde" />
              <Picker.Item label="Utilidades" value="Utilidades" />
              <Picker.Item label="Viagens" value="Viagens" />
              <Picker.Item label="Eventos" value="Eventos" />
              <Picker.Item label="Presentes" value="Presentes" />
              <Picker.Item
                label="Cuidados Pessoais"
                value="Cuidados Pessoais"
              />
              <Picker.Item label="Assinaturas" value="Assinaturas" />
              <Picker.Item label="Impostos" value="Impostos" />
              <Picker.Item label="Seguros" value="Seguros" />
            </Picker>

            <Picker
              selectedValue={type}
              style={styles.picker}
              onValueChange={(itemValue) => setType(itemValue)}
            >
              <Picker.Item label="Selecione o Tipo" value="" />
              <Picker.Item label="Renda" value="renda" />
              <Picker.Item label="Despesa" value="despesa" />
            </Picker>

            <TextInput
              style={styles.input}
              placeholder="Valor"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleAddTransaction}
            >
              <Text style={styles.saveButtonText}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
  },
  transactionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  transactionAmount: {
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 8,
    width: "80%",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  closeButton: {
    backgroundColor: "#8ccaef",
    padding: 5,
    borderRadius: 5,
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  input: {
    backgroundColor: "#f4f4f4",
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  picker: {
    backgroundColor: "#f4f4f4",
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: "#8ccaef",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  fab: {
    backgroundColor: "#8ccaef",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 30,
    right: 30,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
});
