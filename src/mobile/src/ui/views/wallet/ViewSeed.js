import isEqual from 'lodash/isEqual';
import authenticator from 'authenticator';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withNamespaces } from 'react-i18next';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Keyboard,
    TouchableWithoutFeedback,
    AppState,
    Animated,
    Easing,
} from 'react-native';
import { setSetting } from 'shared-modules/actions/wallet';
import { generateAlert } from 'shared-modules/actions/alerts';
import { getSelectedAccountName, getSelectedAccountMeta } from 'shared-modules/selectors/accounts';
import { getThemeFromState } from 'shared-modules/selectors/global';
import FlagSecure from 'react-native-flag-secure-android';
import Fonts from 'ui/theme/fonts';
import SeedPicker from 'ui/components/SeedPicker';
import CustomTextInput from 'ui/components/CustomTextInput';
import SeedStore from 'libs/SeedStore';
import { width, height } from 'libs/dimensions';
import { Icon } from 'ui/theme/icons';
import { Styling } from 'ui/theme/general';
import CtaButton from 'ui/components/CtaButton';
import InfoBox from 'ui/components/InfoBox';
import { isAndroid } from 'libs/device';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';
import { tritsToChars } from 'shared-modules/libs/iota/converter';
import { TWOFA_TOKEN_LENGTH } from 'shared-modules/libs/utils';
import { hash, getTwoFactorAuthKeyFromKeychain } from 'libs/keychain';

const styles = StyleSheet.create({
    container: {
        flex: 11,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    viewContainer: {
        width,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    generalText: {
        fontFamily: Fonts.secondary,
        fontSize: Styling.fontSize4,
        textAlign: 'center',
        backgroundColor: 'transparent',
        paddingBottom: height / 30,
    },
    bottomContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        width,
        paddingHorizontal: width / 15,
    },
    titleText: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize3,
        backgroundColor: 'transparent',
        marginLeft: width / 20,
    },
    infoText: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize3,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    infoTextBold: {
        fontFamily: 'SourceSansPro-Bold',
        fontSize: Styling.fontSize3,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
});

/** View Seed screen component */
class ViewSeed extends Component {
    static propTypes = {
        /** @ignore */
        seedIndex: PropTypes.number.isRequired,
        /** Name for selected account */
        selectedAccountName: PropTypes.string.isRequired,
        /** Type for selected account */
        selectedAccountMeta: PropTypes.object.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        setSetting: PropTypes.func.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
        is2FAEnabled: PropTypes.bool.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            password: null,
            seed: '',
            step: 'isViewingGeneralInfo',
            token: '',
            steps: props.is2FAEnabled
                ? ['isViewingGeneralInfo', 'isEnteringPassword', 'isEntering2FA', 'isViewingSeed']
                : ['isViewingGeneralInfo', 'isEnteringPassword', 'isViewingSeed'],
        };
        this.handleAppStateChange = this.handleAppStateChange.bind(this);
        this.onNextPress = this.onNextPress.bind(this);
        this.onBackPress = this.onBackPress.bind(this);
        this.resetComponent = this.resetComponent.bind(this);
        this.animatedValue = new Animated.Value(0);
    }

    componentDidMount() {
        leaveNavigationBreadcrumb('ViewSeed');
        AppState.addEventListener('change', this.handleAppStateChange);
    }

    componentWillReceiveProps(newProps) {
        if (this.props.seedIndex !== newProps.seedIndex) {
            this.resetComponent();
        }
    }

    componentWillUpdate(newProps, newState) {
        if (this.state.token.length !== TWOFA_TOKEN_LENGTH && newState.token.length === TWOFA_TOKEN_LENGTH) {
            this.onComplete2FA(newState.token);
        }
    }

    componentWillUnmount() {
        AppState.removeEventListener('change', this.handleAppStateChange);
        if (isAndroid) {
            FlagSecure.deactivate();
        }
        delete this.state.seed;
        delete this.state.password;
    }

    /**
     * Determines next step transition
     *
     * @method onNextPress
     */
    async onNextPress() {
        const { step } = this.state;
        if (step === 'isViewingGeneralInfo') {
            return this.navigateToStep('isEnteringPassword');
        } else if (step === 'isEnteringPassword') {
            return this.verifyPassword();
        } else if (step === 'isEntering2FA') {
            return await this.verifyPassword();
        }
    }

    /**
     * Determines previous step transition
     *
     * @method onBackPress
     */
    onBackPress() {
        const { step } = this.state;
        if (step === 'isViewingGeneralInfo') {
            return this.props.setSetting('accountManagement');
        }
        this.resetComponent();
    }

    /**
     * Validates 2FA token and logs in user if accepted
     * @method onComplete2FA
     */
    async onComplete2FA(token) {
        const { t } = this.props;
        if (token) {
            const key = await getTwoFactorAuthKeyFromKeychain(global.passwordHash);
            if (key === null) {
                this.props.generateAlert(
                    'error',
                    t('global:somethingWentWrong'),
                    t('global:somethingWentWrongTryAgain'),
                );
            }
            const verified = authenticator.verifyToken(key, token);
            if (verified) {
                this.navigateToStep('isViewingSeed');
            } else {
                this.props.generateAlert('error', t('twoFA:wrongCode'), t('twoFA:wrongCodeExplanation'));
            }
        } else {
            this.props.generateAlert('error', t('twoFA:emptyCode'), t('twoFA:emptyCodeExplanation'));
        }
    }

    /**
     * Animates to specified progress step
     *
     * @method navigateToStep
     * @param {string} nextStep
     */
    navigateToStep(nextStep) {
        Keyboard.dismiss();
        const stepIndex = this.state.steps.indexOf(nextStep);
        const animatedValue = [0, -1, -2, -3];
        Animated.timing(this.animatedValue, {
            toValue: animatedValue[stepIndex] * width,
            duration: 500,
            easing: Easing.bezier(0.25, 1, 0.25, 1),
        }).start();
        this.setState({ step: nextStep });
    }

    /**
     * Gets seed from keychain if correct password is provided
     *
     * @method verifyPassword
     * @returns {Promise<void>}
     */
    async verifyPassword() {
        const { t, selectedAccountName, selectedAccountMeta, is2FAEnabled } = this.props;
        if (!this.state.password) {
            return this.props.generateAlert('error', t('login:emptyPassword'), t('emptyPasswordExplanation'));
        }
        const pwdHash = await hash(this.state.password);
        if (isEqual(global.passwordHash, pwdHash)) {
            const seedStore = await new SeedStore[selectedAccountMeta.type](pwdHash, selectedAccountName);
            if (isAndroid) {
                FlagSecure.activate();
            }
            this.setState({ seed: await seedStore.getSeed() });
            this.navigateToStep(is2FAEnabled ? 'isEntering2FA' : 'isViewingSeed');
        } else {
            this.props.generateAlert(
                'error',
                t('global:unrecognisedPassword'),
                t('global:unrecognisedPasswordExplanation'),
            );
        }
    }

    /**
     * Hides seed from screen if application goes into inactive or background state
     *
     * @method handleAppStateChange
     * @param {string} nextAppState
     */
    handleAppStateChange(nextAppState) {
        if (nextAppState.match(/inactive|background/)) {
            this.resetComponent();
        }
    }

    /**
     * Resets internal state of the component
     * @method resetComponent
     */
    resetComponent() {
        this.navigateToStep('isViewingGeneralInfo');
        this.setState({ password: null, seed: '', token: '' });
    }

    render() {
        const { t, theme, is2FAEnabled } = this.props;
        const textColor = { color: theme.body.color };
        const { password, token, steps, step } = this.state;

        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View>
                    <Animated.View
                        style={[
                            styles.container,
                            { transform: [{ translateX: this.animatedValue }], width: width * steps.length },
                        ]}
                    >
                        <View style={styles.viewContainer}>
                            <InfoBox>
                                <Text style={[styles.infoText, textColor]}>
                                    <Text style={styles.infoText}>{t('global:masterKey')} </Text>
                                    <Text style={styles.infoText}>{t('walletSetup:seedThief')} </Text>
                                    <Text style={styles.infoTextBold}>{t('walletSetup:keepSafe')} </Text>
                                </Text>
                                <CtaButton
                                    ctaColor={theme.primary.color}
                                    secondaryCtaColor={theme.primary.body}
                                    text={t('okay')}
                                    onPress={this.onNextPress}
                                    ctaWidth={width / 2}
                                    ctaHeight={height / 16}
                                    containerStyle={{ marginTop: height / 20 }}
                                />
                            </InfoBox>
                        </View>
                        <View style={styles.viewContainer}>
                            <Text style={[styles.generalText, textColor]}>{t('viewSeed:enterPassword')}</Text>
                            <CustomTextInput
                                label={t('global:password')}
                                onValidTextChange={(password) => this.setState({ password })}
                                containerStyle={{ width: Styling.contentWidth, paddingVertical: height / 20 }}
                                autoCapitalize="none"
                                autoCorrect={false}
                                enablesReturnKeyAutomatically
                                returnKeyType="done"
                                secureTextEntry
                                value={password}
                                theme={theme}
                                isPasswordInput
                            />
                            <CtaButton
                                ctaColor={theme.primary.color}
                                secondaryCtaColor={theme.primary.body}
                                text={t('viewSeed:viewSeed')}
                                onPress={this.onNextPress}
                                ctaWidth={width / 2}
                                ctaHeight={height / 16}
                                containerStyle={{ marginTop: height / 20 }}
                            />
                        </View>
                        {is2FAEnabled && (
                            <View style={styles.viewContainer}>
                                <Text style={[styles.generalText, textColor]}>{t('twoFA:enterCode')}</Text>
                                <CustomTextInput
                                    label={t('twoFA:twoFaToken')}
                                    onValidTextChange={(token) => this.setState({ token })}
                                    containerStyle={{
                                        width: Styling.contentWidth,
                                        paddingTop: height / 20,
                                        paddingBottom: height / 16 + height / 20,
                                    }}
                                    autoCapitalize="none"
                                    keyboardType="numeric"
                                    autoCorrect={false}
                                    enablesReturnKeyAutomatically
                                    returnKeyType="done"
                                    onSubmitEditing={() => this.onComplete2FA(token)}
                                    theme={theme}
                                    value={token}
                                />
                            </View>
                        )}
                        <View style={styles.viewContainer}>
                            <View style={{ flex: 1 }}>
                                {step === 'isViewingSeed' && (
                                    <SeedPicker seed={tritsToChars(this.state.seed)} theme={theme} />
                                )}
                            </View>
                        </View>
                    </Animated.View>
                    <View style={styles.bottomContainer}>
                        <TouchableOpacity
                            onPress={this.onBackPress}
                            hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                        >
                            <View style={styles.item}>
                                <Icon name="chevronLeft" size={width / 28} color={theme.body.color} />
                                <Text style={[styles.titleText, { color: theme.body.color }]}>{t('global:back')}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

const mapStateToProps = (state) => ({
    seedIndex: state.wallet.seedIndex,
    selectedAccountName: getSelectedAccountName(state),
    selectedAccountMeta: getSelectedAccountMeta(state),
    theme: getThemeFromState(state),
    is2FAEnabled: state.settings.is2FAEnabled,
});

const mapDispatchToProps = {
    setSetting,
    generateAlert,
};

export default withNamespaces(['viewSeed', 'global'])(connect(mapStateToProps, mapDispatchToProps)(ViewSeed));
