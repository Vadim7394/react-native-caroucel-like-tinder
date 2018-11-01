import React, { Component } from 'react';
import { Animated, View, Dimensions } from 'react-native';
import PropTypes from 'prop-types';

const defWidth = Dimensions.get('window').width;

export default class Caroucel extends Component {
  static propTypes = {
    data: PropTypes.array.isRequired,
    renderItem: PropTypes.func.isRequired,
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    widthItem: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  };

  static defaultProps = {
    width: defWidth,
    widthItem: Math.round(defWidth * 0.8),
    height: '50%',
  };

  constructor(props) {
    super(props);
    this._previousLeft = 0;
    this._previousTop = 84;
    this._visibleStackLength = 4;
    this._scales = [1, 0.92, 0.84, 0.76];
    this._refItems = [];
    this._activeItemStyles = {};
    this._animated = new Animated.Value(1);
    this._prevItemIndex = this.props.data.length - 1;
    this._activeIndex = 0;
  }

  _onResponderMove = (evt) => {
    const { widthItem } = this.props;
    if (this._previousLeft === 0) {
      this._previousLeft = evt.nativeEvent.pageX;
    }
    const setX = 1 - (this._previousLeft - evt.nativeEvent.pageX) / widthItem;
    this._animated.setValue(setX);
  };

  _onResponderRelease = (evt) => {
    const { widthItem } = this.props;
    const setX = 1 - (this._previousLeft - evt.nativeEvent.pageX) / widthItem;
    let toValue = 1;
    if (setX < 0.6) toValue = 0;
    if (setX > 1.4) toValue = 2;
    this._previousLeft = 0;
    if (toValue === 0) {
      this._activeIndex = this._prevItemIndex;
      this._prevItemIndex--;
      if (this._prevItemIndex < 0)
        this._prevItemIndex = this.props.data.length - 1;
    }
    if (toValue === 2) {
      this._prevItemIndex = this._activeIndex;
      this._activeIndex++;
      if (this._activeIndex >= this.props.data.length) this._activeIndex = 0;
    }
    Animated.timing(this._animated, { toValue, duration: 100 }).start(() => {
      this.forceUpdate(() => this._animated.setValue(1));
    });
  };

  _getPositionInStack(index) {
    const stackLength = this.props.data.length;
    let itemPosition = index - this._activeIndex;
    if (itemPosition < 0) itemPosition = stackLength + itemPosition;
    return itemPosition;
  }

  _styleItem(index) {
    const stackIndex = this._getPositionInStack(index);
    let scale = this._scales[stackIndex];
    if (!scale) scale = 0;
    const zIndex = scale !== 0 ? 4 - stackIndex : 0;
    let scalePrev = this._scales[stackIndex - 1];
    let scaleNext = this._scales[stackIndex + 1];
    if (!scalePrev) scalePrev = 0;
    if (!scaleNext) scaleNext = 0;
    const { widthItem } = this.props;
    let styleItem = {
      zIndex,
      width: widthItem,
      position: 'absolute',
      alignSelf: 'center',
      top: 0 + (zIndex - 1) * 16,
    };
    if (stackIndex === 0) {
      styleItem.opacity = this._animated.interpolate({
        inputRange: [0, 1, 2],
        outputRange: [1, 1, 0],
      });
      styleItem.transform = [
        {
          scale: this._animated.interpolate({
            inputRange: [0, 1, 2],
            outputRange: [scaleNext, 1, 1],
          }),
        },
        {
          rotate: this._animated.interpolate({
            inputRange: [0, 1, 2],
            outputRange: ['0deg', '0deg', '45deg'],
            extrapolate: 'clamp',
          }),
        },
        {
          translateX: this._animated.interpolate({
            inputRange: [0, 1, 2],
            outputRange: [0, 0, widthItem],
          }),
        },
      ];
    } else if (this._prevItemIndex === index) {
      styleItem.zIndex = this._animated.interpolate({
        inputRange: [0, 0.99, 1, 2],
        outputRange: [5, 5, zIndex, zIndex],
      });
      styleItem.top = this._animated.interpolate({
        inputRange: [0, 0.99, 1, 2],
        outputRange: [this._scales.length * 16, this._scales.length * 16, 0, 0],
      });
      styleItem.opacity = this._animated.interpolate({
        inputRange: [0, 0.99, 1, 2],
        outputRange: [1, 0, 1, 1],
      });
      styleItem.transform = [
        {
          scale: this._animated.interpolate({
            inputRange: [0, 0.99, 1, 2],
            outputRange: [1, 1, scale, scalePrev],
          }),
        },
        {
          rotate: this._animated.interpolate({
            inputRange: [0, 0.99, 1, 2],
            outputRange: ['0deg', '45deg', '0deg', '0deg'],
            extrapolate: 'clamp',
          }),
        },
        {
          translateX: this._animated.interpolate({
            inputRange: [0, 0.99, 1, 2],
            outputRange: [0, widthItem, 0, 0],
          }),
        },
      ];
    } else
      styleItem.transform = [
        {
          scale: this._animated.interpolate({
            inputRange: [0, 1, 2],
            outputRange: [scaleNext, scale, scalePrev],
          }),
        },
      ];
    return styleItem;
  }

  _renderItems = (data, renderItem) => {
    return data.map((item, index) => {
      return (
        <Animated.View
          key={index}
          ref={(item) => (this._refItems[index] = item)}
          style={this._styleItem(index)}>
          {renderItem({ item, index })}
        </Animated.View>
      );
    });
  };

  render() {
    const { data, renderItem, width, height } = this.props;
    if (!data || !renderItem) return false;
    return (
      <View
        style={{ width, height }}
        //onStartShouldSetResponder={(evt) => true}
        onMoveShouldSetResponder={(evt) => true}
        onResponderMove={this._onResponderMove}
        onResponderRelease={this._onResponderRelease}>
        {this._renderItems(data, renderItem)}
      </View>
    );
  }
}
