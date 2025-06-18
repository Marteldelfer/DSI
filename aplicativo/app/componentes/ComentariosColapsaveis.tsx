import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
	SafeAreaView,
} from "react-native";
import { Comentario } from "@/utils/mockData";

export function ComentariosColapsaveis({
  comentarios,
}: {
  comentarios: Comentario[];
}) {
  const [expanded, setExpanded] = useState(false);

  const visibleComments = comentarios;

  function toggleExpanded() {
    setExpanded((prev) => !prev);
  }

  return (
    <SafeAreaView style={[styles.container, {flex: 1}]}>
      {expanded ? <FlatList
				scrollEnabled={false}
        data={visibleComments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.commentContainer}>
            <Text style={styles.commentText}>{item.content}</Text>
          </View>
        )}
      /> : null}

      <TouchableOpacity onPress={toggleExpanded} style={styles.toggleButton}>
        <Text style={styles.toggleButtonText}>
          {expanded ? "Esconder respostas" : "Mostrar respostas"}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 2,
  },
  commentContainer: {
    backgroundColor: "#f2f2f2",
    padding: 10,
    marginBottom: 6,
    borderRadius: 8,
		width: 260
  },
  commentText: {
    fontSize: 14,
    color: "#333",
  },
  toggleButton: {
    padding: 8,
    alignItems: "center",
  },
  toggleButtonText: {
    color: "white",
    fontWeight: "600",
  },
});
