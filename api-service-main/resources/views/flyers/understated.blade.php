<!DOCTYPE html>
<html lang="en">
    <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>understated.pdf</title>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@200;400;500;600;700;800;900&display=swap" rel="stylesheet">
        <style>
            @page {
                margin: 0;
            }

            body {
                font-family: 'Montserrat';
            }

        </style>
    </head>
    <body>

        <header style="border-bottom: 9.5px solid {{ $color  }};height: 140px;">
            <img class="main-logo"
                src="{{ $company['logo'] }}"
                style="margin-top: 52px;margin-left: 70px;
                max-width: 220px;
                max-height: 80px;
                width: auto;
                height: auto;"
            />
        </header>
        <div>
            <div style="display: inline-block;vertical-align: top;width: 360px;margin-left: 30px;text-align: left;">
                <div style="margin-top:50px;font-weight: 700;color: {{ $color }};font-size: 43px;line-height: 35px;">
                    Your rates and payments are one click away.
                </div>
                <div style="font-size: 24px;margin-top: 32px; font-weight:600;line-height: 20px; color:#13294b;">
                    No personal<br/>information required.
                </div>
                <img
                    src="{{ $qr_image }}"
                    width="250"
                    style="margin-top: 13px;margin-left: -25px; color:blue;"
                />
                <div style="font-size: 36px;font-weight: 700;margin-top: -8px;color: {{ $color }};">
                    Ready to save?
                </div>
                <div style="font-size: 18px;font-weight: 700;margin-top: -3px; color:#13294b;">
                    Scan code for live rates
                </div>
            </div>
            <img
                src="{{ config('uplist.flyer_assets_url') . '/understated-new-phone.png' }}"
                width="445"
                height="760"
                style="margin-top: 58px;margin-left: -25px;"
            />
         
            <div style="display: inline-block;vertical-align: top;margin-top: -19px;margin-left: -363px;
                background: {{ $color }};width: 318px;height: 106px;color: #fff;text-align: center;">
            <div class="small-logo" style="position: absolute; top:70; right:55;">
                <img style="height:30px;"
                src="{{ config('uplist.flyer_assets_url') . '/burger.png' }}"
                />
            </div>
            <div style="position: absolute; top:67; left:351; height: 40px;">
                <img style="position:absolute; top:50%; left:50%; transform: translate(-50%, -50%); max-width: 63px; max-height: 40px; width: auto; height: auto;" src="{{ $company['logo'] }}"/>
            </div>
                @php
                $fontSize = '24px';
                $lineHeight = '18px';
                $marginTop = '0px';
                $disclosureHeight = '180px;';

                $addressApt = implode([
                    $property['address'],
                    ...($property['apt_suite'] ? [
                        ', ', $property['apt_suite'] 
                    ] : [])
                ]);

               
                $address = match($source) {
                    'listing' => implode([
                        $property['address'],
                        ', ',
                        ...($property['apt_suite'] ? [
                            $property['apt_suite'], ', ',
                        ] : []),
                        $property['city'],
                        ', ',
                        $property['state_abbreviation'],
                        ' ',
                        $property['zip'],
                    ]),
                    default => implode([
                        $property['address'],
                    ]),
                };
              
                if (Str::length($address) > 40) {
                    $fontSize = '18px';
                    $lineHeight = '16px';
                    $marginTop = '10px';
                }

                if (Str::length($addressApt) > 28) {
                    $fontSize = '16px';
                }

                if (Str::length($addressApt) > 32) {
                    $fontSize = '13px';
                }

                if (Str::length($addressApt) > 42) {
                    $fontSize = '12px';
                }

                if (Str::length($addressApt) > 45) {
                    $fontSize = '10px';
                }

                if (Str::length($disclosure) > 470) {
                    $disclosureHeight = '200px';
                }

                if($company['housing'] == 'equal_housing_lender'){
                    $housing = 'house_lender_white.png';
                }else{
                    $housing = 'house_opportunity_white.png';
                }
                @endphp
                <div style="font-size: {{ $fontSize }} !important;margin-top: 10px;height: 58px; font-weight:500; white-space: nowrap !important; line-height: {{ $lineHeight }}">
                    {{ $addressApt }} <br/>
                    {{ $property['city'] }}, {{ $property['state_abbreviation'] }} {{ $property['zip'] }}
                </div>
                <div style="font-size: 12px;font-weight: 500;margin-top: {{ $marginTop }};">
                    MLS-{{ $listing['mls_number'] }}
                </div>
            </div>
            <img
                src="{{ config('uplist.flyer_assets_url') . '/curly-arrow-left.png' }}"
                width="65"
                style="position: absolute;margin-top: 300px;margin-left: -490px;"
            />
            <div style="position: absolute;margin-top: 150px;margin-left: -147px;font-size: 9px;">
                {{ $default_down_payment }}
            </div>
            <div style="position: absolute;margin-top: 185px;margin-left: -154px;font-size: 9px;">
                {{ $seller_credit }}
            </div>
            <div style="position: absolute;margin-top: 114px;margin-left: -311px;font-size: 9px;">
                {{ $property_value }}
            </div>
            <div style="position: absolute;margin-top: 150px;margin-left: -315px;font-size: 9px;">
                {{ $loan_amount }}
            </div>
        </div>
        <footer style="border-top:2px solid #777777 !important; background-color: {{ $color }};color: #fff;padding: 25px;padding-top: 30px;padding-right: 0;padding-bottom: 0px !important;margin-top: -1px;position: absolute;bottom: 0;left: 0;right: 0;width: 100%;height: {{ $disclosureHeight }};">
            <div style="display: inline-block;vertical-align: top;width: 105px;">
                <img
                    src="{{ $loan_officer['profile_picture'] }}"
                    width="105"
                />
            </div>
            <div style="display: inline-block;vertical-align: top;">
                <div>
                    <div style="display: inline-block;vertical-align: top;margin-left: 10px;font-size: 11px;font-weight: 600;width: 488px;">
                        <div style="margin-bottom:-2px;font-size: 15px;font-weight: 700;">
                            {{ $loan_officer['name'] }}
                        </div>
                        <div style="margin-bottom:-2px;">
                            {{ $loan_officer['job_title'] }}
                        </div>
                        <div style="margin-bottom:-2px;">
                            {{ $loan_officer['email'] }}
                        </div>
                        <div style="margin-bottom:-2px;">
                          {{ $loan_officer['mobile_number'] }}
                        </div>
                        <div>  NMLS# {{ $loan_officer['nmls_number'] }}</div>
                    </div>
                </div>
                <div style="text-align: left;position: absolute;bottom: 8px; z-index: 99;padding-bottom: 9px;">
                    <div style="display: inline-block;vertical-align: bottom;text-align: left;width: 480px;font-size: 9px;margin-left: 10px;">
                        {!! $disclosure !!}@if (substr($disclosure, -1) !== '.').@endif
                    </div>
                    <div style="display: inline-block;vertical-align: bottom;margin-bottom: 5px;margin-left: 20px;">
                       <div style="display: inline-block;vertical-align: top;margin-left: 10px">
                            <div style="font-size: 7px;text-align: center;margin-bottom: -13px; font-family: serif; font-weight:normal;">
                                POWERED BY
                            </div>
                             <img src="{{ config('uplist.flyer_assets_url') . '/Uplist_wordmark_white.png' }}"
                                    width="72"
                                />
                        </div>  
                        <img src="{{ config('uplist.flyer_assets_url') . '/'.$housing }}" width="40"/>
                    </div>
                </div>
            </div>
        </footer>
    </body>
</html>
