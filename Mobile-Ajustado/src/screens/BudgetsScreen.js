import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LineChart } from "react-native-chart-kit";

export default function BudgetScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [category, setCategory] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [data, setData] = useState({
    labels: [],
    datasets: [
      {
        data: [],
      },
    ],
  });

  useEffect(() => {
    const loadBudgetsAndTransactions = async () => {
      try {
        const savedBudgets = await AsyncStorage.getItem("budgets");
        if (savedBudgets !== null) {
          setBudgets(JSON.parse(savedBudgets));
        }
        const savedTransactions = await AsyncStorage.getItem("transactions");
        if (savedTransactions !== null) {
          setTransactions(JSON.parse(savedTransactions));
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    };

    loadBudgetsAndTransactions();
  }, []);

  useEffect(() => {
    // Calculate data for the chart
    const labels = [];
    const chartData = [];

    budgets.forEach((budget) => {
      const spentAmount = transactions
        .filter((transaction) => transaction.category === budget.category)
        .reduce((acc, transaction) => acc + transaction.amount, 0);

      labels.push(budget.category);
      chartData.push(budget.budgetAmount);
    });

    setData({
      labels,
      datasets: [{ data: chartData }],
    });
  }, [budgets, transactions]);

  const handleAddBudget = async () => {
    if (category && budgetAmount) {
      const newBudget = {
        id: budgets.length + 1,
        category,
        budgetAmount: parseFloat(budgetAmount),
      };

      const updatedBudgets = [...budgets, newBudget];
      setBudgets(updatedBudgets);

      try {
        await AsyncStorage.setItem("budgets", JSON.stringify(updatedBudgets));
      } catch (error) {
        console.error("Erro ao salvar orçamentos:", error);
      }

      setCategory("");
      setBudgetAmount("");
      setModalVisible(false);
    } else {
      alert("Por favor, preencha todos os campos.");
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.chartContainer}>
          <LineChart
            data={data}
            width={Dimensions.get("window").width - 30}
            height={220}
            yAxisLabel="R$ "
            chartConfig={{
              backgroundColor: "#fff",
              backgroundGradientFrom: "#fff",
              backgroundGradientTo: "#fff",
              decimalPlaces: 2,
              color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`,
              style: {
                borderRadius: 16,
              },
            }}
            style={styles.chart}
          />
        </View>

        <View style={styles.budgetsContainer}>
          <Text style={styles.budgetsTitle}>Orçamentos:</Text>
          {budgets.map((item) => {
            const spentAmount = transactions
              .filter((transaction) => transaction.category === item.category)
              .reduce((acc, transaction) => acc + transaction.amount, 0);
            const isExceeded = spentAmount > item.budgetAmount;

            return (
              <View key={item.id} style={styles.budgetCard}>
                <Text style={styles.budgetCategory}>{item.category}</Text>
                <Text style={styles.budgetDetails}>
                  Valor Orçado: R$ {item.budgetAmount.toFixed(2)}
                </Text>
                <Text style={styles.budgetDetails}>
                  Valor Gasto: R$ {spentAmount.toFixed(2)}
                </Text>
                <Text
                  style={[
                    styles.budgetStatus,
                    { color: isExceeded ? "#df4822" : "#2aad40" },
                  ]}
                >
                  {isExceeded ? "Excedido" : "Dentro do Orçamento"}
                </Text>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => {
                    setCategory(item.category);
                    setBudgetAmount(item.budgetAmount.toString());
                    setModalVisible(true);
                  }}
                >
                  <Text style={styles.editButtonText}>✎</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          setCategory("");
          setBudgetAmount("");
          setModalVisible(true);
        }}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Adicionar Orçamento</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>X</Text>
              </TouchableOpacity>
            </View>

            <Picker
              selectedValue={category}
              style={styles.picker}
              onValueChange={(itemValue) => setCategory(itemValue)}
            >
              <Picker.Item label="Selecione a Categoria" value="" />
              <Picker.Item label="Alimentação" value="Alimentação" />
              <Picker.Item label="Transporte" value="Transporte" />
              <Picker.Item label="Moradia" value="Moradia" />
              <Picker.Item label="Lazer" value="Lazer" />
              <Picker.Item label="Educação" value="Educação" />
              <Picker.Item label="Saúde" value="Saúde" />
              <Picker.Item label="Utilidades" value="Utilidades" />
              <Picker.Item label="Viagens" value="Viagens" />
              <Picker.Item label="Eventos" value="Eventos" />
              <Picker.Item label="Presentes" value="Presentes" />
              <Picker.Item label="Cuidados Pessoais" value="Cuidados Pessoais" />
              <Picker.Item label="Assinaturas" value="Assinaturas" />
              <Picker.Item label="Impostos" value="Impostos" />
              <Picker.Item label="Seguros" value="Seguros" />
            </Picker>

            <TextInput
              style={styles.input}
              placeholder="Valor Orçado"
              value={budgetAmount}
              onChangeText={setBudgetAmount}
              keyboardType="numeric"
            />

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleAddBudget}
            >
              <Text style={styles.saveButtonText}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 80,
  },
  chartContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  budgetsContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#d4af37",
    margin: 10,
    padding: 10,
  },
  budgetsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#284767",
  },
  budgetCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#d4af37",
    padding: 10,
    marginBottom: 10,
    elevation: 2,
    position: "relative",
  },
  budgetCategory: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#376f7b",
  },
  budgetDetails: {
    fontSize: 16,
    color: "#284767",
  },
  budgetStatus: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 5,
  },
  editButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#d4af37",
    borderRadius: 15,
    padding: 5,
  },
  editButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  addButton: {
    backgroundColor: "#d4af37",
    borderRadius: 50,
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    bottom: 30,
    right: 30,
    elevation: 5,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 30,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    width: "90%",
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#376f7b",
  },
  closeButton: {
    backgroundColor: "#d4af37",
    borderRadius: 20,
    padding: 5,
  },
  closeButtonText: {
    fontSize: 16,
    color: "#fff",
  },
  picker: {
    height: 50,
    width: "100%",
    marginBottom: 10,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#d4af37",
    marginBottom: 10,
    padding: 5,
  },
  saveButton: {
    backgroundColor: "#376f7b",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
