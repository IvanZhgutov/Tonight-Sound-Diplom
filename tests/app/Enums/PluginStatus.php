<?php

namespace App\Enums;

enum PluginStatus: string
{
    /** В каталоге студии */
    case Available = 'available';

    /** Запрошен артистом, ждёт решения админа («Скоро») */
    case Requested = 'requested';

    /** Недавно добавлен по запросу («Новинка») */
    case Fresh = 'new';
}
