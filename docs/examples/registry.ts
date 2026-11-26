// Every live example shown in /docs. Add a line when you add a file to
// docs/examples; the source shown in the Code tab is read from the same file.
import AvatarFallback from './avatar/fallback'
import AvatarOverview from './avatar/overview'
import AvatarSizes from './avatar/sizes'
import AvatarStackDensity from './avatar-stack/density'
import AvatarStackOverview from './avatar-stack/overview'
import ButtonDestructive from './button/destructive'
import ButtonDisabledReason from './button/disabled-reason'
import ButtonFormSubmit from './button/form-submit'
import ButtonLoading from './button/loading'
import ButtonOverview from './button/overview'
import ButtonSizes from './button/sizes'
import ButtonToolbar from './button/toolbar'
import ButtonVariants from './button/variants'
import ButtonWithIcons from './button/with-icons'
import CalendarMin from './calendar/min'
import CalendarOverview from './calendar/overview'
import CheckboxLabelPosition from './checkbox/label-position'
import CheckboxOverview from './checkbox/overview'
import CheckboxSizes from './checkbox/sizes'
import ChipFills from './chip/fills'
import ChipOverview from './chip/overview'
import ChipRemovable from './chip/removable'
import ChipStatesExample from './chip/states'
import DateInputLabels from './date-input/labels'
import DateInputOverview from './date-input/overview'
import DateInputSizes from './date-input/sizes'
import FlowButtonAttached from './flow-button/attached'
import FlowButtonLoading from './flow-button/loading'
import FlowButtonOverview from './flow-button/overview'
import FlowButtonSizes from './flow-button/sizes'
import FlowButtonVariants from './flow-button/variants'
import GroupInputCompositions from './group-input/compositions'
import GroupInputOverview from './group-input/overview'
import GroupInputSelection from './group-input/selection'
import GroupInputValidation from './group-input/validation'
import IconButtonCounter from './icon-button/counter'
import IconButtonOverview from './icon-button/overview'
import IconButtonSizes from './icon-button/sizes'
import IconButtonVariants from './icon-button/variants'
import LabelButtonOverview from './label-button/overview'
import LabelButtonWithIcons from './label-button/with-icons'
import OTPInputOverview from './otp-input/overview'
import OTPInputValidation from './otp-input/validation'
import RadioButtonLabelPosition from './radio-button/label-position'
import RadioButtonOverview from './radio-button/overview'
import RadioButtonSizes from './radio-button/sizes'
import SelectionLabels from './selection/labels'
import SelectionMultiple from './selection/multiple'
import SelectionOverview from './selection/overview'
import SelectionSizes from './selection/sizes'
import TagOverview from './tag/overview'
import TagRemovable from './tag/removable'
import TagSizes from './tag/sizes'
import TextAreaAction from './text-area/action'
import TextAreaOverview from './text-area/overview'
import TextAreaToolbar from './text-area/toolbar'
import TextAreaValidation from './text-area/validation'
import TextButtonIconsAvatar from './text-button/icons-avatar'
import TextButtonOverview from './text-button/overview'
import TextButtonSizes from './text-button/sizes'
import TextButtonUnderlineBold from './text-button/underline-bold'
import TextButtonWrapped from './text-button/wrapped'
import TextInputLabels from './text-input/labels'
import TextInputOverview from './text-input/overview'
import TextInputPassword from './text-input/password'
import TextInputSizes from './text-input/sizes'
import TextInputValidation from './text-input/validation'
import ToggleOverview from './toggle/overview'
import ToggleSizes from './toggle/sizes'

import type { ComponentType } from 'react'

const EXAMPLES: Record<string, ComponentType> = {
  'button/destructive': ButtonDestructive,
  'button/disabled-reason': ButtonDisabledReason,
  'button/form-submit': ButtonFormSubmit,
  'button/loading': ButtonLoading,
  'button/overview': ButtonOverview,
  'button/sizes': ButtonSizes,
  'button/toolbar': ButtonToolbar,
  'button/variants': ButtonVariants,
  'button/with-icons': ButtonWithIcons,
  'flow-button/attached': FlowButtonAttached,
  'flow-button/loading': FlowButtonLoading,
  'flow-button/overview': FlowButtonOverview,
  'flow-button/sizes': FlowButtonSizes,
  'flow-button/variants': FlowButtonVariants,
  'icon-button/counter': IconButtonCounter,
  'icon-button/overview': IconButtonOverview,
  'icon-button/sizes': IconButtonSizes,
  'icon-button/variants': IconButtonVariants,
  'checkbox/label-position': CheckboxLabelPosition,
  'checkbox/overview': CheckboxOverview,
  'checkbox/sizes': CheckboxSizes,
  'radio-button/label-position': RadioButtonLabelPosition,
  'radio-button/overview': RadioButtonOverview,
  'radio-button/sizes': RadioButtonSizes,
  'avatar/fallback': AvatarFallback,
  'avatar/overview': AvatarOverview,
  'avatar/sizes': AvatarSizes,
  'avatar-stack/density': AvatarStackDensity,
  'avatar-stack/overview': AvatarStackOverview,
  'chip/fills': ChipFills,
  'chip/overview': ChipOverview,
  'chip/removable': ChipRemovable,
  'chip/states': ChipStatesExample,
  'tag/overview': TagOverview,
  'tag/removable': TagRemovable,
  'tag/sizes': TagSizes,
  'toggle/overview': ToggleOverview,
  'toggle/sizes': ToggleSizes,
  'label-button/overview': LabelButtonOverview,
  'label-button/with-icons': LabelButtonWithIcons,
  'text-button/icons-avatar': TextButtonIconsAvatar,
  'calendar/min': CalendarMin,
  'calendar/overview': CalendarOverview,
  'date-input/labels': DateInputLabels,
  'date-input/overview': DateInputOverview,
  'date-input/sizes': DateInputSizes,
  'selection/labels': SelectionLabels,
  'selection/multiple': SelectionMultiple,
  'selection/overview': SelectionOverview,
  'selection/sizes': SelectionSizes,
  'group-input/compositions': GroupInputCompositions,
  'group-input/overview': GroupInputOverview,
  'group-input/validation': GroupInputValidation,
  'group-input/selection': GroupInputSelection,
  'otp-input/overview': OTPInputOverview,
  'otp-input/validation': OTPInputValidation,
  'text-area/action': TextAreaAction,
  'text-area/overview': TextAreaOverview,
  'text-area/toolbar': TextAreaToolbar,
  'text-area/validation': TextAreaValidation,
  'text-input/labels': TextInputLabels,
  'text-input/overview': TextInputOverview,
  'text-input/password': TextInputPassword,
  'text-input/sizes': TextInputSizes,
  'text-input/validation': TextInputValidation,
  'text-button/overview': TextButtonOverview,
  'text-button/sizes': TextButtonSizes,
  'text-button/underline-bold': TextButtonUnderlineBold,
  'text-button/wrapped': TextButtonWrapped,
}

export { EXAMPLES }
