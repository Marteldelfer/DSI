// aplicativo/src/styles.tsx
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#2E3D50',
    },
    textInput: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "white",
        borderRadius: 26,
        paddingHorizontal: 15,
        marginVertical: 10,
        minHeight: 50
    },
    input: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
        color: 'black',
    },
    Botao: {
        backgroundColor: '#3E9C9C',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 25,
        marginTop: 10,
        width: '100%',
        alignItems: 'center',
    },
    textoBotao: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
