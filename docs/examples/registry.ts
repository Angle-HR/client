// Every live example shown in /docs. Add a line when you add a file to
// docs/examples; the source shown in the Code tab is read from the same file.
import ButtonDestructive from './button/destructive'
import ButtonDisabledReason from './button/disabled-reason'
import ButtonFormSubmit from './button/form-submit'
import ButtonLoading from './button/loading'
import ButtonOverview from './button/overview'
import ButtonSizes from './button/sizes'
import ButtonToolbar from './button/toolbar'
import ButtonVariants from './button/variants'
import ButtonWithIcons from './button/with-icons'
import FlowButtonAttached from './flow-button/attached'
import FlowButtonLoading from './flow-button/loading'
import FlowButtonOverview from './flow-button/overview'
import FlowButtonSizes from './flow-button/sizes'
import FlowButtonVariants from './flow-button/variants'
import IconButtonCounter from './icon-button/counter'
import IconButtonOverview from './icon-button/overview'
import IconButtonSizes from './icon-button/sizes'
import IconButtonVariants from './icon-button/variants'
import LabelButtonOverview from './label-button/overview'
import LabelButtonWithIcons from './label-button/with-icons'
import TextButtonIconsAvatar from './text-button/icons-avatar'
import TextButtonOverview from './text-button/overview'
import TextButtonSizes from './text-button/sizes'
import TextButtonUnderlineBold from './text-button/underline-bold'
import TextButtonWrapped from './text-button/wrapped'

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
  'label-button/overview': LabelButtonOverview,
  'label-button/with-icons': LabelButtonWithIcons,
  'text-button/icons-avatar': TextButtonIconsAvatar,
  'text-button/overview': TextButtonOverview,
  'text-button/sizes': TextButtonSizes,
  'text-button/underline-bold': TextButtonUnderlineBold,
  'text-button/wrapped': TextButtonWrapped,
}

export { EXAMPLES }
