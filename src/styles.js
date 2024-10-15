import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    containerCards: {
        //margin: 5,
        padding: 0,
        marginBottom: 5 
    },
    containerCard: {
        flex: 1,
        flexDirection: 'row'
    },
    containerCardBody: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 25
    },
    containerCardText: {
        flexDirection: 'column',
        justifyContent: 'flex-start'
    },
    backdrop: { 
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },


    currentRouteContainer: {
        flexDirection: 'row', 
        alignItems: 'center',  
        justifyContent: 'flex-start', 
        height: 40, 
    },
    textHeaderCard: {
        flex: 1, 
        flexDirection: 'row', 
        alignItems: 'center',
        flexWrap: 'wrap', 
        justifyContent: 'space-between',
        textAlign: 'center',
        fontWeight: 'bold'
    },
    textHeaderCardIcon: {
        opacity: 0.85,
        color: '#8F9BB3',
        marginHorizontal: 5
    },
    textTimeLeft: {
        marginLeft: 5,
        paddingHorizontal: 5,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    textBodyCardWithLeftView: {
        flex: 1, 
        flexDirection: 'row', 
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingVertical: 10
    },
    textHeaderCardOrder: {
        flex: 1, 
        flexDirection: 'row', 
        alignItems: 'center',
        flexWrap: 'wrap', 
        padding: 10,
        justifyContent: 'space-between'
    },

    textHeaderCardRoute: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between', // Выравнивание элементов по ширине
        textAlign: 'justify', // Выравнивание текста по ширине
        width: '100%', // Убедитесь, что контейнер занимает всю ширину
    },
    titleList: {
        marginVertical: 5   
    },
    spinnerContainer: {
        position: 'absolute',
        zIndex: 999,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    bottomSection: {
        marginTop: 'auto',
        padding: 16,
        alignItems: 'center',
    },
    versionText: {
        fontSize: 12,
        color: '#888',
        marginTop: 8,
    },

    container: {
        flex: 1,
        padding: 16, // Отступы от границ экрана
    },

    containerFlatList: {
        minHeight: '100%',
        marginLeft: 5,
        marginRight: 5,
        backgroundColor: 'transparent',
    },
    layout: {
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'stretch',
        position: 'relative',
        padding: 20,
      },
      backgroundContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        flexDirection: 'row',
        flexWrap: 'wrap', // Позволяет изображению заполнять пространство
      },
      background: {
        width: 1081, // Ширина одного изображения
        height: 1081, // Высота одного изображения
        opacity: 0.3, // Прозрачность
      },
      bottonNavigatorText: {
        color: "#3E3346",
        fontSize: 11
      },
      bottonNavigatorIcon: {
        color: "#3E3346",
        fontSize: 11
      }
  }
);