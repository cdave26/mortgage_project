<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link href="https://db.onlinewebfonts.com/c/20b8e550dbac9d31e068a148a2393128?family=MinionPro-Regular" rel="stylesheet" type="text/css"/>
         <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@100;200;300;400;500;600;700;800&display=swap" rel="stylesheet">
        <title>tech_green.pdf</title>
        
        <style type="text/css">
            @page {
                margin: 0;
            }

            body p.disclosure-text{
                font-family: 'MinionPro-Regular' !important;
            }

            body {
               font-family: 'Poppins', sans-serif;
            }

            .tb-top-section{
                background-image: url("{{ config('uplist.flyer_assets_url') . '/tech_green.png' }}") ;
                background-repeat: no-repeat;
                background-attachment: fixed;
                background-position: right top; 
                background-size:100% 100%;
            }

            .address-details{
                text-align: left;
                font-weight: 700;
                color: #000000;
                width: 150;
            }

            .address-details p{
                margin-bottom: -12px;
            }

        </style>
    </head>
    <body>
        
        @php
        $fontSizeProfile = '11px';
        $positionBottomText = '175';
        $addressBottom = '170';
        $lineHeight = '10px';
        $addressFontSize = '14px';

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

        if(Str::length($address) > 75) {
            $addressBottom = '155';
            $lineHeight = '9px';
        }elseif(Str::length($address) > 50) {
            $addressBottom = '155';
        }

        if($company['housing'] == 'equal_housing_lender'){
            $housing = 'house_lender_white.png';
        }else{
            $housing = 'house_opportunity_white.png';
        }

           
        if (Str::length($loan_officer['email']) > 36) {
            $fontSizeProfile = '9px';
            $positionBottomText = '175';
            
        }

        if (Str::length($addressApt) > 36) {
            $addressFontSize = '11px';
        }

        @endphp

        <div>
            <div class="tb-top-section" style="height:100%;">
                <img
                    style="display: flex-end; position: absolute; max-width: 190px; max-height: 80px; width: auto; height: auto; right:30; top:40;" src="{{ $company['logo'] }}"/>

                <div style="height: 70px;position: absolute;left:70; bottom:245;">
                    <img style="position:absolute; top:50%; left:50%; transform: translate(-50%, -50%); max-width: 140px; max-height: 60px; width: auto; height: auto;" src="{{ $company['logo'] }}"/>
                </div>
                <div>
                    <img src="{{ $loan_officer['profile_picture'] }}" style="max-width: 100px; max-height: 90px; position: absolute; top:487.7; left:447;"/>
                </div>  
                <div style="vertical-align: top;margin-left: 100px;font-size: {{ $fontSizeProfile }};font-weight: 700; text-align:left; color:#ffffff; position:absolute; bottom:{{ $positionBottomText }}; left:372; line-height:10px; width:214px;">
                    <div>{{ $loan_officer['name'] }}</div>
                    <div>{{ $loan_officer['job_title'] }}</div>
                    <div>{{ $loan_officer['email'] }}</div>
                    <div>{{ $loan_officer['mobile_number'] }}</div>
                    <div>NMLS# {{ $loan_officer['nmls_number'] }} </div>
                </div>
                <div style="position: absolute; top:100; right:110; font-size:65px; color:#ffffff; line-height:2.5rem;  width:600px; font-weight:700;">
                    Your rates &
                    payments.
                    <br>One click away.
                </div>
                <div style="font-size:14px; position: absolute; top:230; right:327; color:#ffffff; line-height:2.5rem; font-weight:700;">READY TO SAVE? SCAN CODE FOR LIVE RATES</div>
                <div style="font-size:18px; position: absolute; top:344; right:85; color:#ffffff; line-height:14px; font-weight:600; text-align:left; font-weight:700;">NO PERSONAL <br>INFORMATION <br> REQUIRED.</div>
                <div class="div" style="position: absolute; top:314; right:443;">
                    <img src="{{ $qr_image }}" class="qr_code" width="155" style="margin-left: -15px;"/>
                </div>
                <div class="address-details" style="position: absolute;bottom: {{ $addressBottom }};left:70;line-height: {{ $lineHeight }}; font-size:{{$addressFontSize}}">
                    <p style="white-space: nowrap !important;">{{ $addressApt }}</p>
                    <p style="white-space: nowrap !important;">{{ $property['city'] }}, {{ $property['state_abbreviation'] }} {{ $property['zip'] }}</p>
                    <p>PRICE: {{$property_value}}</p>
                    <p>MILITARY / VETERAN: NO</p>
                    <p>FIRST TIME HOME BUYER: NO</p>
                </div>
            </div>
           
            <p class="disclosure-text" style="font-family: 'MinionPro-Regular'; line-height:9px !important; color:#ffffff; display: inline-block;vertical-align: bottom;text-align: left; width: 187px; font-size: 9px; margin-left: 42px; position: absolute; bottom:70; right:38;">
                {!! $disclosure !!}@if (substr($disclosure, -1) !== '.').@endif
            </p>
            <div abel style="font-size:10px; font-weight:700; padding-bottom:10px: margin-left:14px; height:15px; background-color:#44b77b; width:175px; position:absolute; bottom:116; left:120; border-radius:30px; text-align:center; height:25px;">
                CHANGE SEARCH DETAILS
            </div>
            <div style="background-color:#ffffff25; display: inline-block;vertical-align: bottom;text-align: left; width: 214px; font-size: 8px; margin-left: 42px; font-weight:300; position: absolute; bottom:20; left:31; width:340px; height:110px; ">
                <!-- <label style="font-size:8px; font-weight:700; padding-bottom:10px: margin-left:15px; height:15px;width:120px; position:absolute; bottom:77; left:2;">LOAN AMOUNT</label> -->
                <label style="font-size:8px; font-weight:400; padding-bottom:10px: margin-left:15px; height:15px; background-color:#ececec; width:120px; position:absolute; bottom:64.3; left:4;">{{ $loan_amount }}</label>
                <!-- <label style="font-size:8px; font-weight:700; padding-bottom:10px: margin-left:15px; height:15px;  width:100px; position:absolute; bottom:77; left:172;">DOWN %</label> -->
                <label style="font-size:8px; font-weight:400; padding-bottom:10px: margin-left:15px; height:15px; background-color:#ececec; width:80px; position:absolute; bottom:64.3; left:175;">{{ $default_down_payment }}</label>
                <!-- <label style="font-size:8px; font-weight:700; padding-bottom:10px: margin-left:15px; height:15px;  width:120px; position:absolute; bottom:46; left:2;">CREDIT SCORE</label> -->
                <!-- <label style="font-size:8px; font-weight:700; padding-bottom:10px: margin-left:15px; height:15px;  width:100px; position:absolute; bottom:46; left:129;">OCCUPANCY</label> -->
                <label style="font-size:8px; font-weight:400; padding-bottom:10px: margin-left:15px; height:15px; background-color:#ececec; width:100px; position:absolute; bottom:34; left:131; padding-left:5px;">Primary Residence</label>
                <label style="font-size:8px; font-weight:400; padding-bottom:10px: margin-left:15px; height:15px; background-color:#ececec; width:130px; position:absolute; bottom:34; left:3; padding-left:5px;">760 or higher (Excellent)</label>
                <!-- <label style="font-size:8px; font-weight:700; padding-bottom:10px: margin-left:15px; height:15px;  width:120px; position:absolute; bottom:16; left:2;">MILITARY / VETERAN</label> -->
                <!-- <label style="font-size:8px; font-weight:700; padding-bottom:10px: margin-left:15px; height:15px;  width:100px; position:absolute; bottom:16; left:129;">FIRST TIME HOMEBUYER</label>      -->
                <div style="display: flex; background-color:#ffffff;  padding-bottom:10px: margin-left:15px; height:15px;  width:25; position:absolute; bottom:0; left:0; padding-left:4px;">
                    <img src="{{ config('uplist.flyer_assets_url') . '/radio-btn-2.png' }}" alt="" height="8" style="margin-top:2px;">
                    <label style="font-size:8px; font-weight:700;">Yes</label>
                </div>
                <div style="display: flex; background-color:#ffffff;  padding-bottom:10px: margin-left:15px; height:15px;  width:25; position:absolute; bottom:0; left:29; padding-left:4px;">
                    <img src="{{ config('uplist.flyer_assets_url') . '/radio-btn.png' }}" alt="" height="8" style="margin-top:2px;">
                    <label style="font-size:8px; font-weight:700;">No</label>
                </div>
                <div style="display: flex; background-color:#ffffff;  padding-bottom:10px: margin-left:15px; height:15px;  width:25; position:absolute; bottom:0; left:128; padding-left:4px;">
                    <img src="{{ config('uplist.flyer_assets_url') . '/radio-btn-2.png' }}" alt="" height="8" style="margin-top:2px;">
                    <label style="font-size:8px; font-weight:700;">Yes</label>
                </div>
                <div style="display: flex; background-color:#ffffff;  padding-bottom:10px: margin-left:15px; height:15px;  width:25; position:absolute; bottom:0; left:155; padding-left:4px;">
                    <img src="{{ config('uplist.flyer_assets_url') . '/radio-btn.png' }}" alt="" height="8" style="margin-top:2px;">
                    <label style="font-size:8px; font-weight:700;">No</label>
                </div>
            </div>
        </div>
        <div style="display: inline-block;vertical-align: bottom;margin-bottom: 5px;margin-left: 10px; position: absolute; right:41; bottom:10;">
            <div style="display: inline-block;vertical-align: top;margin-left: 5px">
                <div style="font-size: 7px;text-align: center;margin-top: 18px; font-family: 'MinionPro-Regular'; font-weight:normal; color:#ffffff; margin-bottom:-7px;">
                    POWERED BY&nbsp;
                </div>
                <img src="{{ config('uplist.flyer_assets_url') . '/Uplist_wordmark_white.png' }}"
                    width="72"
                />
            </div>  
            <img src="{{ config('uplist.flyer_assets_url') . '/'.$housing }}" height="40" style="padding-top: 20px !important;  padding-left:15px;"/>
        </div>
    </body>
</html>
