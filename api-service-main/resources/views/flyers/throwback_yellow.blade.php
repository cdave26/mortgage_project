<!DOCTYPE html>
<html lang="en">
    <head>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@100;200;300;400;500;600;700;800&display=swap" rel="stylesheet">
        <title>throwback_yellow.pdf</title>
        <style type="text/css">
            @page {
                margin: 0;
            }

            body {
                 font-family: 'Poppins', sans-serif !important;
            }

            .tb-top-section{
                background-image: url("{{ config('uplist.flyer_assets_url') . '/tb-bg-yellow.png' }}") ;
                background-repeat: no-repeat;
                background-attachment: fixed;
                background-position: center top; 
            }

        </style>
    </head>
    <body>
        @php
        $fontSizeProfile = '16px';
        $positionBottomText = '180';
        $positionAddressBottomText = '180';
        $addressFontSize = '16px';

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

        if($company['housing'] == 'equal_housing_lender'){
            $housing = 'house_lender_black.png';
        }else{
            $housing = 'house_opportunity_black.png';
        }

        if (Str::length($loan_officer['email']) > 36) {
            $fontSizeProfile = '13px';
            $addressFontSize = '13px';
            $positionBottomText = '200';
            $positionAddressBottomText = '200';
        }

        if (Str::length($address) > 60) {
            $positionAddressBottomText = '160';
        }

        if (Str::length($addressApt) > 29) {
            $addressFontSize = '12px';
             $fontSizeProfile = '13px';
        }
        if(Str::length($addressApt) > 36) {
            $addressFontSize = '11px';
            $fontSizeProfile = '12px';
        }

        if (Str::length($addressApt) > 40) {
            $addressFontSize = '10px';
        }

        if (Str::length($addressApt) > 43) {
            $fontSizeProfile = '11px';
            $addressFontSize = '9px';
        }

        if (Str::length($addressApt) > 53) {
            $fontSizeProfile = '11px';
            $addressFontSize = '8px';
        } 
  
        @endphp
        <div style="background-color:#ffffff !important;margin:auto;padding:35px;">
            <div class="tb-top-section" style="height:100%; border-top-right-radius:50px;border-top-left-radius:50px;">
                <img
                    style="display: flex-end; 
                    position: absolute; 
                    max-width: 143px;
                    max-height: 90px;                   
                    top:50%;
                    left:50%;
                    transform: translate(-50%, -50%);
                    width: auto;
                    height: auto; left:162; top:110;"
                    src="{{ $company['logo'] }}"/>
                <div style="height: 160px;position: absolute;bottom: 213px;left:90px;">
                           <img src="{{ $loan_officer['profile_picture'] }}" style="position: absolute;top: 50%;left: 50%;transform: translate(-50%, -50%); border:2px solid #ffffff; max-height:140px; max-width:140px; width: auto;height: auto;"/>
                </div>  
                <div style="width: 320px;height: 160px;font-size: {{ $fontSizeProfile }};font-weight: 700; text-align:center; color:#1870b8; position:absolute; bottom: 215px; right:193;">
                    <div style="position: absolute;top: 50%;left: 50%;transform: translate(-50%, -50%);">
                        <div>
                            {{ $loan_officer['name'] }}
                        </div>
                        <div style="margin-top:-11px;">
                            {{ $loan_officer['job_title'] }}
                        </div>
                        <div style="margin-top:-11px;">
                            {{ $loan_officer['email'] }}
                        </div>
                        <div style="margin-top:-10px;">
                            {{ $loan_officer['mobile_number'] }}
                        </div >
                        <div style="margin-top:-11px;">
                            NMLS# {{ $loan_officer['nmls_number'] }}
                        </div>
                    </div>
                </div>
                <div style="position: absolute; top:342; right:253;">
                    <img src="{{ $qr_image }}" class="qr_code" width="160" style="margin-left: -18px;"/>
                </div>
                <div style="width: 200px;height: 160px;position: absolute;bottom: 215px;right: 60px;text-align: center;font-weight: 700;color: #1870b8;">
                    <p style="position: relative;margin-bottom: 5px;">
                        <span style="width: 170px;position: absolute;top: 50%;left: 50%;transform: translate(-50%, -50%);line-height: 12px;font-size: {{ $addressFontSize }};margin-bottom:10px;  white-space: nowrap !important;">{{ $addressApt }} <br/> {{ $property['city'] }}, {{ $property['state_abbreviation'] }} {{ $property['zip'] }}</span>
                    </p>
                </div>
            </div>
         
            <footer style="color: #000000;padding: 20px;padding-top: 20px;padding-right: 0;padding-bottom: 0px !important;margin-top: -1px;position: absolute;bottom: 0;left: 0;right: 0;width: 100%;height: 105px;">
                <div style="text-align: left;position: absolute;bottom: 8px; z-index: 99;padding-bottom: 0px;">
                    <div style="display: inline-block;vertical-align: bottom;text-align: left;width: 525px;font-size: 9px;margin-left: 9px; font-weight:400; margin-left:88px; line-height:9px !important;">
                        {!! $disclosure !!}@if (substr($disclosure, -1) !== '.').@endif
                    </div>
                </div>
                 <div style="display: inline-block;vertical-align: bottom;margin-bottom: 5px;margin-left: 10px; position: absolute; right:45; bottom:5;">
                    <div style="display: inline-block;vertical-align: top;margin-left: 5px">
                        <div style="font-size: 7px;text-align: center;margin-top: 10px; font-family: serif; font-weight:normal; margin-bottom:5px;">
                            POWERED BY
                        </div>
                         <img src="{{ config('uplist.flyer_assets_url') . '/uplist-logo-blk.png' }}" height="30"/>
                    </div>  
                    <img src="{{ config('uplist.flyer_assets_url') . '/'.$housing }}" height="40" style="padding-top: 20px !important;  padding-left:15px;"/>
                </div>
            </footer>
        </div>
    </body>
</html>
