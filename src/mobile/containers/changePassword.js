import toUpper from 'lodash/toUpper';
import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    Dimensions,
    Text,
    TouchableWithoutFeedback,
    TouchableOpacity,
    Image,
    ImageBackground,
    ScrollView,
    StatusBar,
} from 'react-native';
import Colors from '../theme/Colors';
import Fonts from '../theme/Fonts';
import { connect } from 'react-redux';
import { setPassword, getAccountInfo } from '../../shared/actions/iotaActions';
import { getFromKeychain } from '../../shared/libs/cryptography';
import { TextField } from 'react-native-material-textfield';
import OnboardingButtons from '../components/onboardingButtons.js';
import DropdownAlert from 'react-native-dropdownalert';
import { Keyboard } from 'react-native';

const { height, width } = Dimensions.get('window');

class ChangePassword extends Component {
    constructor() {
        super();
        this.state = {
            currentPassword: '',
            newPassword: '',
            confirmedNewPassword: '',
        };
    }

    renderTextField(value, label, onChangeText) {
        // This should be abstracted away as an independent component
        // We are using almost the same field styles and props
        // across all app
        const props = {
            style: styles.textField,
            labelTextStyle: { fontFamily: Fonts.tertiary },
            labelFontSize: height / 55,
            fontSize: height / 40,
            baseColor: Colors.white,
            tintColor: Colors.orangeDark,
            autoCapitalize: 'none',
            autoCorrect: false,
            enablesReturnKeyAutomatically: true,
            containerStyle: styles.textFieldContainer,
            secureTextEntry: true,
            label,
            value,
            onChangeText,
        };

        return <TextField {...props} />;
    }

    render() {
        const { currentPassword, newPassword, confirmedNewPassword } = this.state;

        return (
            <ImageBackground source={require('../../shared/images/bg-green.png')} style={styles.container}>
                <StatusBar barStyle="light-content" />
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View>
                        <View style={styles.topWrapper}>
                            <Image source={require('../../shared/images/iota-glow.png')} style={styles.logo} />
                            <View style={styles.headerWrapper}>
                                <Text style={styles.header}>{toUpper('change password')}</Text>
                            </View>
                        </View>
                        <View style={styles.midWrapper}>
                            <View style={styles.infoTextWrapper}>
                                <Image source={require('../../shared/images/info.png')} style={styles.infoIcon} />
                                <Text style={styles.infoText}>
                                    Ensure you use a strong password of at least 12 characters.
                                </Text>
                            </View>
                            {this.renderTextField(currentPassword, 'Current Password', currentPassword =>
                                this.setState({ currentPassword }),
                            )}
                            {this.renderTextField(newPassword, 'New Password', newPassword =>
                                this.setState({ newPassword }),
                            )}
                            {this.renderTextField(confirmedNewPassword, 'Confirm New Password', confirmedNewPassword =>
                                this.setState({ confirmedNewPassword }),
                            )}
                        </View>
                        <View style={styles.bottomWrapper}>
                            <OnboardingButtons
                                onLeftButtonPress={() => {}}
                                onRightButtonPress={() => {}}
                                leftText={'BACK'}
                                rightText={'DONE'}
                            />
                        </View>
                    </View>
                </TouchableWithoutFeedback>
                <DropdownAlert
                    ref={ref => (this.dropdown = ref)}
                    successColor={Colors.dropdown.success}
                    errorColor={Colors.dropdown.error}
                    titleStyle={styles.dropdownTitle}
                    defaultTextContainer={styles.dropdownTextContainer}
                    messageStyle={styles.dropdownMessage}
                    imageStyle={styles.dropdownImage}
                    inactiveStatusBarStyle="light-content"
                />
            </ImageBackground>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.brand.primary,
    },
    topWrapper: {
        flex: 1.3,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: height / 22,
    },
    midWrapper: {
        flex: 2.2,
        alignItems: 'center',
    },
    bottomWrapper: {
        flex: 2,
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: height / 20,
    },
    headerWrapper: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: height / 8,
        paddingTop: height / 35,
    },
    header: {
        color: Colors.white,
        fontFamily: Fonts.primary,
        fontSize: width / 23,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    logo: {
        height: width / 5,
        width: width / 5,
    },
    dropdownTitle: {
        fontSize: 16,
        textAlign: 'left',
        fontWeight: 'bold',
        color: 'white',
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Regular',
    },
    dropdownTextContainer: {
        flex: 1,
        padding: 15,
    },
    dropdownMessage: {
        fontSize: 14,
        textAlign: 'left',
        fontWeight: 'normal',
        color: 'white',
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Regular',
    },
    dropdownImage: {
        padding: 8,
        width: 36,
        height: 36,
        alignSelf: 'center',
    },
    infoTextWrapper: {
        borderColor: 'white',
        borderWidth: 1,
        borderRadius: 15,
        width: width / 1.6,
        height: height / 6.1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingHorizontal: width / 40,
        borderStyle: 'dotted',
        paddingTop: height / 60,
        marginTop: height / 50,
    },
    infoText: {
        color: Colors.white,
        fontFamily: Fonts.secondary,
        fontSize: width / 27.6,
        textAlign: 'center',
        paddingTop: height / 60,
        backgroundColor: 'transparent',
    },
    infoIcon: {
        width: width / 20,
        height: width / 20,
    },
    textField: {
        color: Colors.white,
        fontFamily: Fonts.tertiary,
    },
    textFieldContainer: {
        width: width / 1.65,
        paddingTop: height / 40,
    },
});

const mapStateToProps = state => ({
    iota: state.iota,
});

const mapDispatchToProps = dispatch => ({
    setPassword: password => {
        dispatch(setPassword(password));
    },
    getAccountInfo: seed => {
        dispatch(getAccountInfo(seed));
    },
});

export default connect(mapStateToProps, mapDispatchToProps)(ChangePassword);
